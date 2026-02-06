import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { email } = await req.json();

    // 이메일 유효성 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "유효한 이메일 주소를 입력해주세요." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const dbUrl = Deno.env.get("SUPABASE_URL") || Deno.env.get("DB_URL");
    const serviceKey = Deno.env.get("SERVICE_ROLE_KEY");

    if (!dbUrl || !serviceKey) {
      return new Response(
        JSON.stringify({ error: "서버 설정 오류", debug: { hasUrl: !!dbUrl, hasKey: !!serviceKey } }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(dbUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const normalizedEmail = email.toLowerCase().trim();

    // 기존 구독자 확인
    const { data: existing } = await supabase
      .from("subscribers")
      .select("id, status")
      .eq("email", normalizedEmail)
      .single();

    if (existing) {
      if (existing.status === "active") {
        return new Response(
          JSON.stringify({
            success: true,
            message: "이미 구독 중입니다! 매일 아침 부자브리핑을 확인해주세요.",
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // 구독 해지했던 사용자 재구독
      const { error } = await supabase
        .from("subscribers")
        .update({ status: "active", unsubscribed_at: null })
        .eq("id", existing.id);

      if (error) throw error;
    } else {
      // 신규 구독 - IP 주소 첫 번째 값만 추출
      const forwardedFor = req.headers.get("x-forwarded-for");
      const ip = forwardedFor
        ? forwardedFor.split(",")[0].trim()
        : req.headers.get("cf-connecting-ip") || null;

      const { error } = await supabase.from("subscribers").insert({
        email: normalizedEmail,
        ip_address: ip,
        source: "website",
      });

      if (error) throw error;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message:
          "구독이 완료되었습니다! 매일 아침 부자브리핑을 보내드릴게요.",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Subscribe error:", error);
    return new Response(
      JSON.stringify({
        error: "구독 처리 중 오류가 발생했습니다.",
        debug: error?.message || error?.code || JSON.stringify(error)
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
