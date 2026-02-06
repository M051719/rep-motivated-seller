import { serve } from "https://deno.land/std@0.131.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { location } = await req.json();
    const apiKey = Deno.env.get("WEATHER_API_KEY");

    if (!apiKey) {
      throw new Error("Weather API key not configured");
    }

    if (!location) {
      throw new Error("Location is required");
    }

    // Build the URL for weather API
    const url = new URL("https://api.weatherapi.com/v1/forecast.json");
    url.searchParams.append("key", apiKey);
    url.searchParams.append("q", location);
    url.searchParams.append("days", "3");
    url.searchParams.append("aqi", "no");
    url.searchParams.append("alerts", "no");

    // Make the weather API request
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    // Format the response to include only necessary data
    const formattedData = {
      location: data.location,
      current: data.current,
      forecast: data.forecast.forecastday.map((day: any) => ({
        date: day.date,
        maxtemp_f: day.day.maxtemp_f,
        mintemp_f: day.day.mintemp_f,
        condition: day.day.condition,
        daily_chance_of_rain: day.day.daily_chance_of_rain,
      })),
    };

    return new Response(JSON.stringify({ data: formattedData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
