import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { type, user } = body;

    console.log('API Route called with:', { type, user });

    const response = await fetch('https://api.hyperliquid.xyz/info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type, user }),
    });

    if (!response.ok) {
      console.error('Hyperliquid API error:', response.status);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Data received from Hyperliquid');
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from Hyperliquid', details: error.message },
      { status: 500 }
    );
  }
}
