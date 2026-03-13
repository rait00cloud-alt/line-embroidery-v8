// src/app/api/shipping/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { cart, address } = await req.json();

    if (!cart || cart.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (!address?.line1 || !address?.city || !address?.zip || !address?.country) {
      return NextResponse.json({ error: "Incomplete address" }, { status: 400 });
    }

    const apiKey = process.env.SHIPPO_API_KEY;
    if (!apiKey) {
      console.error("SHIPPO_API_KEY not configured");
      return NextResponse.json({ error: "Shipping service not configured" }, { status: 500 });
    }

    // Calculate total weight from cart items
    const totalWeight = cart.reduce((sum: number, item: any) => {
      const itemWeight = item.weight || 0.5; // default 0.5 lb per item
      return sum + (itemWeight * item.quantity);
    }, 0);

    // Prepare parcel - consolidate into one box
    const parcel = {
      length: "12",
      width: "10",
      height: "8",
      distance_unit: "in",
      weight: totalWeight.toFixed(2),
      mass_unit: "lb",
    };

    // Call Shippo API directly using fetch
    const shipmentData = {
      address_from: {
        name: process.env.WAREHOUSE_NAME || "Your Store",
        street1: process.env.WAREHOUSE_STREET || "215 Clayton St",
        city: process.env.WAREHOUSE_CITY || "San Francisco",
        state: process.env.WAREHOUSE_STATE || "CA",
        zip: process.env.WAREHOUSE_ZIP || "94117",
        country: process.env.WAREHOUSE_COUNTRY || "US",
      },
      address_to: {
        name: "Customer",
        street1: address.line1,
        street2: address.line2 || "",
        city: address.city,
        state: address.state || "",
        zip: address.zip,
        country: address.country,
      },
      parcels: [parcel],
      async: false,
    };

    console.log("Creating shipment with data:", JSON.stringify(shipmentData, null, 2));

    const response = await fetch("https://api.goshippo.com/shipments/", {
      method: "POST",
      headers: {
        "Authorization": `ShippoToken ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(shipmentData),
    });

    const responseText = await response.text();
    console.log("Shippo API Response Status:", response.status);
    console.log("Shippo API Response:", responseText);

    if (!response.ok) {
      let errorMessage = "Failed to calculate shipping";
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.detail || errorData.error || errorMessage;
        console.error("Shippo API Error:", errorData);
      } catch (e) {
        console.error("Non-JSON error response:", responseText);
      }
      return NextResponse.json({ error: errorMessage }, { status: response.status });
    }

    const shipment = JSON.parse(responseText);

    // Check if we have rates
    if (!shipment.rates || shipment.rates.length === 0) {
      return NextResponse.json(
        { error: "No shipping rates available for this address" },
        { status: 404 }
      );
    }

    // Filter out rates with errors and format response
    const validRates = shipment.rates
      .filter((rate: any) => !rate.messages || rate.messages.length === 0)
      .map((rate: any) => ({
        object_id: rate.object_id,
        provider: rate.provider,
        service_level: rate.servicelevel?.name || rate.servicelevel?.token || "Standard",
        amount: parseFloat(rate.amount),
        currency: rate.currency,
        estimated_days: rate.estimated_days || 5,
        duration_terms: rate.duration_terms || "",
      }))
      .sort((a: any, b: any) => a.amount - b.amount); // Sort by price

    console.log(`Found ${validRates.length} valid rates`);

    return NextResponse.json({ rates: validRates });

  } catch (err: any) {
    console.error("Shipping API Error:", err);
    return NextResponse.json(
      { 
        error: "Failed to calculate shipping",
        details: err.message 
      },
      { status: 500 }
    );
  }
}