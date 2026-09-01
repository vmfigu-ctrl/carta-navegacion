// netlify/functions/update-carta.js

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { 
      statusCode: 405, 
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  try {
    const { htmlContent } = JSON.parse(event.body);
    
    if (!htmlContent) {
      return { 
        statusCode: 400, 
        body: JSON.stringify({ error: "Missing htmlContent" })
      };
    }

    const NETLIFY_TOKEN = process.env.NETLIFY_TOKEN;
    const NETLIFY_SITE_ID = process.env.NETLIFY_SITE_ID;

    if (!NETLIFY_TOKEN || !NETLIFY_SITE_ID) {
      return { 
        statusCode: 500, 
        body: JSON.stringify({ error: "Missing env vars" })
      };
    }

    const response = await fetch(
      `https://api.netlify.com/api/v1/sites/${NETLIFY_SITE_ID}/deploy`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${NETLIFY_TOKEN}`,
          "Content-Type": "application/octet-stream"
        },
        body: Buffer.from(htmlContent, 'utf-8')
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: errorText.substring(0, 200) })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true,
        message: "✅ Actualizado en Netlify exitosamente"
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
