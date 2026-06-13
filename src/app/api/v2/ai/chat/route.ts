import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// JSR construction expert system prompt
const SYSTEM_PROMPT = `You are an expert AI Construction Assistant for Jay Shree Ram Group, a premium B2B construction materials marketplace based in Jalgaon, Maharashtra, India.

COMPANY INFO:
- Name: Jay Shree Ram Group (JSR)
- Location: Girad, Taluka Bhadgaon, Jalgaon, Maharashtra
- Contact: +91 8010871044
- Products: Cement (UltraTech, Ambuja, ACC), TMT Steel (JSW, Tata Tiscon), River Sand, Aggregates, Bricks, Waterproofing

YOUR EXPERTISE:
1. Building material recommendations based on project type, area, and budget
2. Material quantity estimation (cement, steel, sand, bricks for any house size)
3. Construction cost estimation for Maharashtra region
4. Technical advice on grades, specifications, and standards (IS codes)
5. Distance-based logistics and pricing guidance
6. GST rates and tax implications on materials

PRICING REFERENCE (approx, subject to change):
- OPC 53 Cement: ₹380-430/bag (50kg)
- PPC Cement: ₹365-400/bag (50kg)
- TMT Steel Fe550D: ₹64,000-68,000/MT
- River Sand: ₹5,500-6,500/brass
- Basalt Aggregates: ₹4,000-4,200/brass
- Red Clay Bricks: ₹7-9/piece
- AAC Blocks: ₹100-130/piece

MATERIAL QUANTITY FORMULAS (per 1000 sqft G+0 RCC house):
- Cement: ~600-700 bags (OPC 53)
- TMT Steel: ~5-6 MT (Fe550D)
- River Sand: ~35-40 brass
- Aggregates (20mm): ~25-30 brass
- Bricks: ~18,000-22,000 pieces
- Adjust proportionally for G+1 (multiply by ~1.7), G+2 (multiply by ~2.3)

ALWAYS:
- Be helpful, precise, and professional
- Provide specific quantity estimates when asked
- Recommend JSR products where appropriate
- Include WhatsApp contact: wa.me/918010871044 for orders
- Give answers in the same language the user writes (Hindi/Marathi/English)
- Format numbers in Indian format (lakhs, crores)`;

// Smart local fallback (no API key required)
function localAIResponse(message: string): string {
  const msg = message.toLowerCase();
  
  // Quantity estimation
  if (msg.includes('sqft') || msg.includes('sq ft') || msg.includes('square feet') || msg.includes('house') || msg.includes('घर') || msg.includes('मकान')) {
    const sqftMatch = msg.match(/(\d+)\s*(sqft|sq\s*ft|square\s*feet)/i);
    const floors = msg.includes('g+1') ? 2 : msg.includes('g+2') ? 3 : msg.includes('g+3') ? 4 : 1;
    const baseSqft = sqftMatch ? parseInt(sqftMatch[1]) : 1000;
    const totalSqft = baseSqft * floors;
    const factor = totalSqft / 1000;
    
    return `## 🏗️ Material Estimate for ${totalSqft.toLocaleString('en-IN')} Sq.Ft (${msg.includes('g+') ? msg.match(/g\+\d/i)?.[0]?.toUpperCase() : 'G+0'} Building)

| Material | Quantity | Est. Cost |
|----------|----------|-----------|
| 🏗️ OPC 53 Cement | **${Math.round(650 * factor)} bags** | ₹${(Math.round(650 * factor) * 400).toLocaleString('en-IN')} |
| ⚙️ TMT Steel Fe550D | **${(5.5 * factor).toFixed(1)} MT** | ₹${(5.5 * factor * 66000).toLocaleString('en-IN')} |
| 🌊 River Sand | **${Math.round(38 * factor)} brass** | ₹${(Math.round(38 * factor) * 6000).toLocaleString('en-IN')} |
| 🪨 20mm Aggregates | **${Math.round(27 * factor)} brass** | ₹${(Math.round(27 * factor) * 4200).toLocaleString('en-IN')} |
| 🧱 Red Clay Bricks | **${Math.round(20000 * factor).toLocaleString('en-IN')} pcs** | ₹${(Math.round(20000 * factor) * 8).toLocaleString('en-IN')} |

**Estimated Material Total: ₹${Math.round((650 * factor * 400) + (5.5 * factor * 66000) + (38 * factor * 6000) + (27 * factor * 4200) + (20000 * factor * 8)).toLocaleString('en-IN')}**

> ⚡ *Note: These are approximate quantities. Actual requirements may vary based on design, soil, and construction method. Add 10% wastage buffer.*

📲 WhatsApp us for a detailed quotation: **wa.me/918010871044**`;
  }

  // Cement advice
  if (msg.includes('cement') || msg.includes('सीमेंट') || msg.includes('सिमेंट')) {
    return `## 🏗️ Cement Guide — JSR Marketplace

**OPC 53 Grade** (Best for structural work):
- Use for: RCC columns, beams, slabs, foundations
- Brands: UltraTech, ACC, Ambuja
- Rate: ₹380-430/bag (50kg)
- Coverage: 1 bag = ~0.035 cubic meter of concrete

**PPC (Portland Pozzolana Cement)** (Best for plastering):
- Use for: Brickwork mortar, plaster, non-structural RCC
- Brands: Ambuja, Shree Ultra, Birla
- Rate: ₹365-400/bag (50kg)
- Advantage: Better workability, lower heat of hydration

**Rule of Thumb for 1000 sqft house:**
- Cement needed: 650-700 bags total
- RCC work: Use OPC 53
- Plastering: Use PPC

📲 Order now: **wa.me/918010871044**`;
  }

  // Steel advice
  if (msg.includes('steel') || msg.includes('tmt') || msg.includes('सरिया') || msg.includes('स्टील')) {
    return `## ⚙️ TMT Steel Rebar Guide — JSR Marketplace

**Fe 550D Grade** (Recommended for all RCC):
- Higher yield strength (550 N/mm²)
- Superior ductility for seismic zones
- Available: 8mm, 10mm, 12mm, 16mm, 20mm, 25mm, 32mm

**JSW Neosteel** vs **Tata Tiscon**:
| Feature | JSW Neosteel | Tata Tiscon |
|---------|-------------|-------------|
| Grade | Fe 550D | Fe 550D |
| Rate | ₹64,000/MT | ₹68,000/MT |
| Certification | IS 1786 | IS 1786 |
| Corrosion Resistance | ✅ | ✅ |

**For 1000 sqft G+0 house: ~5.5 MT needed**

📲 Get wholesale rates: **wa.me/918010871044**`;
  }

  // Sand advice
  if (msg.includes('sand') || msg.includes('रेत') || msg.includes('रेती') || msg.includes('वाळू')) {
    return `## 🌊 Sand Guide — JSR Direct Mine Supply

**Girna River Double-Washed Sand** (Best quality):
- ✅ Silt content < 1% (vs max allowed 8%)
- ✅ Coarse grade — ideal for RCC and brickwork
- Rate: ₹6,500/brass (ex-stockyard Bhadgaon)
- Source: Girna River, near Bhadgaon

**Tapi River Fine Plaster Sand**:
- Triple-washed for smooth plaster finish
- Rate: ₹5,500/brass

**M-Sand (Manufactured Sand)** — Eco-friendly option:
- Crusher sand from basalt
- Uniform grading, no silt
- Rate: ₹4,800/brass

📐 **1 Brass = 100 cubic feet**
📦 Delivered by our dumper fleet directly to your site.

📲 **wa.me/918010871044**`;
  }

  // Pricing
  if (msg.includes('price') || msg.includes('rate') || msg.includes('cost') || msg.includes('दर') || msg.includes('भाव') || msg.includes('किंमत')) {
    return `## 💰 Current Market Rates — JSR Marketplace

| Material | Rate | Unit |
|----------|------|------|
| OPC 53 Cement | ₹380-430 | per 50kg bag |
| PPC Cement | ₹365-400 | per 50kg bag |
| TMT Steel Fe550D | ₹64,000-68,000 | per Metric Ton |
| Girna River Sand | ₹6,500 | per Brass |
| Plaster Sand | ₹5,500 | per Brass |
| M-Sand | ₹4,800 | per Brass |
| Basalt 20mm Agg. | ₹4,200 | per Brass |
| Basalt 10mm Agg. | ₹4,000 | per Brass |
| Red Clay Bricks | ₹7.50-9 | per piece |
| AAC Blocks | ₹110-130 | per piece |

> ⚠️ *Prices subject to market fluctuation. Logistics surcharge applies based on delivery distance from Bhadgaon.*
> 🏷️ **Dealer & bulk discounts available on 50+ bag orders**

📲 **wa.me/918010871044** for confirmed rates`;
  }

  return `🤝 **Jay Shree Ram Group — AI Construction Assistant**

I can help you with:
- 📐 **Material estimates** — "I need materials for 1500 sqft G+1 house"
- 💰 **Pricing info** — "What is the rate for cement?"
- 🏗️ **Product guidance** — "Which cement is best for RCC?"
- 📦 **Order placement** — Browse our marketplace

What would you like to know? Feel free to ask in Hindi, Marathi or English!

📲 Direct WhatsApp: **wa.me/918010871044**`;
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  const body = await req.json();
  const { message, conversationId, language = 'en' } = body;

  if (!message?.trim()) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }

  // Get or create conversation
  let convId = conversationId;
  if (user && !convId) {
    const conv = await prisma.aIConversation.create({
      data: { userId: user.userId, title: message.slice(0, 50) },
    });
    convId = conv.id;
  }

  // Get conversation history
  let history: any[] = [];
  if (convId) {
    const msgs = await prisma.aIMessage.findMany({
      where: { conversationId: convId },
      orderBy: { createdAt: 'asc' },
      take: 10,
    });
    history = msgs.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] }));
  }

  let responseText = '';

  // Try Gemini API first
  if (GEMINI_API_KEY) {
    try {
      const geminiRes = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [
            ...history,
            { role: 'user', parts: [{ text: message }] },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1500,
            topP: 0.9,
          },
        }),
      });

      if (geminiRes.ok) {
        const data = await geminiRes.json();
        responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      }
    } catch (e) {
      console.error('Gemini API error:', e);
    }
  }

  // Fallback to local smart AI
  if (!responseText) {
    responseText = localAIResponse(message);
  }

  // Save messages to DB
  if (convId) {
    await prisma.aIMessage.createMany({
      data: [
        { conversationId: convId, role: 'user', content: message },
        { conversationId: convId, role: 'assistant', content: responseText },
      ],
    });
  } else if (user) {
    await prisma.chatMessage.createMany({
      data: [
        { userId: user.userId, role: 'user', content: message, language },
        { userId: user.userId, role: 'assistant', content: responseText, language },
      ],
    });
  }

  return NextResponse.json({
    response: responseText,
    conversationId: convId,
    model: GEMINI_API_KEY ? 'gemini-1.5-flash' : 'jsr-local-ai',
  });
}
