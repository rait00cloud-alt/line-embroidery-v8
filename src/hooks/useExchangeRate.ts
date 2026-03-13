// src/app/api/exchange-rate/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const res = await fetch(
    "https://api.exchangerate.host/latest?base=USD"
  );

  if (!res.ok) {
    return NextResponse.json({}, { status: 500 });
  }

  const data = await res.json();

  return NextResponse.json({
    BRL: data.rates.BRL,
    EUR: data.rates.EUR,
    CNY: data.rates.CNY,
  });
}

