import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { message, language } = await request.json();
    if (!message) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }

    const activeLang: 'en' | 'hi' | 'mr' = ['en', 'hi', 'mr'].includes(language) ? language : 'en';
    const lText = message.toLowerCase();

    // Sourced Sand information
    const sandDetails = {
      en: "We offer natural sand sourced directly from standard river basins:\n1. **Girna River Double-Washed Sand**: Perfect for robust structural concrete casting.\n2. **Tapi River Plaster Sand**: Fine-grain sand with low silt content, ideal for smooth internal/external plastering.\n3. **Concrete M-Sand**: Engineered manufactured sand (crushed basalt) for green buildings.",
      hi: "हम सीधे स्वीकृत नदी घाटों से प्राप्त प्राकृतिक रेत प्रदान करते हैं:\n1. **गिरणा नदी डबल-वॉश रेत**: मजबूत कंक्रीट ढलाई (Slab Casting) के लिए सर्वोत्तम।\n2. **तापी नदी प्लास्टर रेत**: कम सिल्ट वाली महीन रेत, दीवारों के प्लास्टर के लिए उत्तम।\n3. **कंक्रीट एम-सैंड**: पर्यावरण-अनुकूल निर्माण के लिए निर्मित रेत (क्रश गिट्टी)।",
      mr: "आम्ही थेट अधिकृत नदी पात्रांमधून काढलेली दर्जेदार वाळू पुरवतो:\n1. **गिरणा नदी डबल-वॉश वाळू**: मजबूत कंक्रीट स्लॅब कास्टिंगसाठी सर्वोत्तम.\n2. **तापी नदी प्लास्टर वाळू**: बारीक आणि स्वच्छ वाळू, प्लास्टर कामासाठी उत्तम.\n3. **कंक्रीट एम-सँड**: पर्यावरणास पूरक अशी कृत्रिम वाळू (क्रश खडीपासून बनवलेली)."
    };

    // Logistics Fleet & Live Drivers contacts
    const logisticsDetails = {
      en: "Real-time dispatches are handled by Mr. Bhaiyya Patil's transit fleet. Live drivers coordinates:\n- **Ramesh Shinde**: +91 80108 71044 (Ashok Leyland Dumper MH-19 BJ-4321)\n- **Vinay Pawar**: +91 96570 98765 (Tata Signa Tipper MH-19 BJ-8842)\n- **Rajesh Deshmukh**: +91 98341 55678 (Eicher Pro Dumper MH-19 BJ-5510)\n- **Sanjay Chaudhari**: +91 91582 34567 (Mahindra Blazo MH-19 BJ-6789)",
      hi: "वास्तविक समय (Real-time) में सामग्री प्रेषण श्री भय्या पाटिल के लॉजिस्टिक्स बेड़े द्वारा किया जाता है। लाइव ड्राइवरों के संपर्क:\n- **रमेश शिंदे**: +91 80108 71044 (अशोक लेलैंड डंपर MH-19 BJ-4321)\n- **विनय पवार**: +91 96570 98765 (टाटा सिग्ना टिपर MH-19 BJ-8842)\n- **राजेश देशमुख**: +91 98341 55678 (आयशर प्रो डंपर MH-19 BJ-5510)\n- **महिंद्रा ब्लेज़ो**: +91 91582 34567 (MH-19 BJ-6789)",
      mr: "रिअल-टाइम डिलिव्हरी श्री भय्या पाटील यांच्या ट्रान्सपोर्ट ताफ्याद्वारे हाताळली जाते. लाइव्ह ड्रायव्हर्स संपर्क तपशील:\n- **रमेश शिंदे**: +91 80108 71044 (अशोक लेलँड डंपर MH-19 BJ-4321)\n- **विनय पवार**: +91 96570 98765 (टाटा सिग्ना टिपर MH-19 BJ-8842)\n- **राजेश देशमुख**: +91 98341 55678 (आयशर प्रो डंपर MH-19 BJ-5510)\n- **संजय चौधरी**: +91 91582 34567 (महिंद्रा ब्लेझो MH-19 BJ-6789)"
    };

    // Seller Contacts
    const sellerDetails = {
      en: "For placing official commercial wholesale bulk orders, contact our Corporate Dispatch Desk:\n- **Mr. Bhaiyya Patil (Director)**: +91 80108 71044\n- **Mr. Sagar Patil (Sales Manager)**: +91 98234 56789\nLocation: Girad, Taluka Bhadgaon, Jalgaon District, Maharashtra.",
      hi: "थोक व्यावसायिक ऑर्डर (Wholesale bulk orders) दर्ज करने के लिए, हमारे मुख्य प्रेषण डेस्क से संपर्क करें:\n- **श्री भय्या पाटिल (निदेशक)**: +91 80108 71044\n- **श्री सागर पाटिल (बिक्री प्रबंधक)**: +91 98234 56789\nकार्यालय: गिरड, तालुका भड़गांव, जिला जलगांव, महाराष्ट्र।",
      mr: "अधिकृत व्यावसायिक घाऊक ऑर्डर्स नोंदवण्यासाठी आमच्या मुख्य कार्यालयाशी संपर्क साधा:\n- **श्री भय्या पाटील (संचालक)**: +91 80108 71044\n- **श्री सागर पाटील (सेल्स मॅनेजर)**: +91 98234 56789\nकार्यालय पत्ता: गिरड, तालुका भडगाव, जिल्हा जळगाव, महाराष्ट्र."
    };

    // General Material info
    const generalMaterials = {
      en: "We supply OPC 53 & PPC Cement (UltraTech, ACC, Ambuja) and Fe 550D TMT Steel Rebars (JSW, Tata). Net prices for bulk purchases are automatically discounted for logged-in dealers (~8% off base prices).",
      hi: "हम ओपीसी 53 और पीपीसी सीमेंट (UltraTech, ACC, Ambuja) और Fe 550D टीएमटी सरिया (JSW, Tata) की आपूर्ति करते हैं। लॉग-इन डीलरों के लिए कीमतों में 8% तक की छूट दी जाती है।",
      mr: "आम्ही ओपीसी ५३ आणि पीपीसी सिमेंट (UltraTech, ACC, Ambuja) आणि Fe 550D टीएमटी लोखंडी सरळ्या (JSW, Tata) पुरवतो. लॉग-इन केलेल्या डीलर्सना ८% पर्यंत थेट सवलत मिळते."
    };

    // Callback greeting
    const callbackPrompt = {
      en: "Sure! Please share your contact name so we can register a callback from our sales team.",
      hi: "ज़रूर! कृपया अपना नाम साझा करें ताकि हमारी सेल्स टीम आपसे कॉल बैक का समन्वय कर सके।",
      mr: "नक्कीच! कृपया आपले नाव कळवा जेणेकरून आमची सेल्स टीम तुम्हाला कॉल बॅक करू शकेल."
    };

    // Standard Fallback help
    const defaultFallback = {
      en: "Understood. Please let me know how I can help you today. You can ask about our 'sand types', 'driver numbers', 'cement steel prices', or request a 'callback'.",
      hi: "मैं समझ गया। कृपया मुझे बताएं कि मैं आपकी क्या सहायता कर सकता हूँ। आप हमारे 'रेत के प्रकार', 'ड्राइवर नंबर', 'सीमेंट और सरिया के भाव' के बारे में पूछ सकते हैं, या 'कॉल बैक' का अनुरोध कर सकते हैं।",
      mr: "मला समजले. मी तुम्हाला बांधकाम साहित्याविषयी कशी मदत करू? आपण 'वाळूचे प्रकार', 'ड्रायव्हहरचे नंबर', 'सिमेंट लोखंडाचे भाव' याबद्दल विचारू शकता किंवा 'कॉल बॅक' विनंती करू शकता."
    };

    let reply = "";

    // Match keywords
    if (lText.includes('sand') || lText.includes('river') || lText.includes('girna') || lText.includes('tapi') || lText.includes('रेत') || lText.includes('वाळू') || lText.includes('नदी')) {
      reply = sandDetails[activeLang] || sandDetails.en;
    } else if (lText.includes('driver') || lText.includes('truck') || lText.includes('dumper') || lText.includes('fleet') || lText.includes('ड्राइवर') || lText.includes('गाडी') || lText.includes('चालक')) {
      reply = logisticsDetails[activeLang] || logisticsDetails.en;
    } else if (lText.includes('seller') || lText.includes('contact') || lText.includes('number') || lText.includes('phone') || lText.includes('patil') || lText.includes('भय्या') || lText.includes('नंबर') || lText.includes('संपर्क')) {
      reply = sellerDetails[activeLang] || sellerDetails.en;
    } else if (lText.includes('cement') || lText.includes('steel') || lText.includes('price') || lText.includes('cost') || lText.includes('सिमेंट') || lText.includes('लोखंड') || lText.includes('दर') || lText.includes('भाव')) {
      reply = generalMaterials[activeLang] || generalMaterials.en;
    } else if (lText.includes('callback') || lText.includes('call') || lText.includes('फोन')) {
      reply = callbackPrompt[activeLang] || callbackPrompt.en;
    } else {
      reply = defaultFallback[activeLang] || defaultFallback.en;
    }

    return NextResponse.json({ reply });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
