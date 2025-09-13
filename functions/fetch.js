const fetch = require("node-fetch");

exports.handler = async function(event, context) {
  try {
    // Hit external API
    const apiRes = await fetch("https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json", {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    const data = await apiRes.json();
    const items = data.data.list.slice(0, 10);

    // Firebase save
    const firebaseUrl = "https://web-admin-e297c-default-rtdb.asia-southeast1.firebasedatabase.app/satta_results.json";
    for (const item of items) {
      const issue = item.issueNumber;
      const number = item.number;
      const type = number <= 4 ? "SMALL" : "BIG";

      // Save using PATCH to avoid overwriting all data
      await fetch(`${firebaseUrl}?orderBy="issue"&equalTo="${issue}"`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [issue]: { result_number: number, type, timestamp: new Date().toISOString() } })
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ status: "ok", saved: items.length })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ status: "error", message: err.message }) };
  }
};
