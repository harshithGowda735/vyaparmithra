import React, { useState, useRef } from "react";

const API = "http://127.0.0.1:8000";

const s = {
  body: { minHeight:"100vh", background:"linear-gradient(135deg,#0f0c29,#302b63,#24243e)", display:"flex", flexDirection:"column", alignItems:"center", padding:"40px 16px", fontFamily:"'Segoe UI',sans-serif", color:"#fff" },
  logo: { fontSize:"2.4rem", fontWeight:800, letterSpacing:"-1px", marginBottom:4 },
  sub:  { color:"#aaa", fontSize:"1rem", marginBottom:40 },
  card: { background:"rgba(255,255,255,0.06)", backdropFilter:"blur(14px)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:20, padding:"32px 40px", width:"100%", maxWidth:640, marginBottom:24 },
  btn:  (r) => ({ width:"100%", padding:"16px", fontSize:"1.1rem", fontWeight:700, border:"none", borderRadius:12, cursor:r?"default":"pointer", background:r?"linear-gradient(90deg,#e53e3e,#c53030)":"linear-gradient(90deg,#38a169,#2f855a)", color:"#fff", boxShadow:"0 4px 20px rgba(0,0,0,0.4)", transition:"transform 0.1s", transform:r?"scale(0.98)":"scale(1)", marginBottom:16 }),
  sectionTitle: { fontSize:"1.1rem", fontWeight:700, marginBottom:12, color:"#a78bfa" },
  pre: { background:"rgba(0,0,0,0.35)", borderRadius:10, padding:16, overflowX:"auto", maxHeight:340, fontSize:"0.78rem", lineHeight:1.6, color:"#e2e8f0" },
  badge: (c) => ({ display:"inline-block", background:c, borderRadius:8, padding:"2px 10px", fontSize:"0.75rem", fontWeight:700, marginRight:8, marginBottom:6 }),
  schCard: { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:12, padding:"14px 18px", marginBottom:12 },
  row: { display:"flex", alignItems:"center", gap:8, marginBottom:6 },
  statusText: (st) => ({ textAlign:"center", padding:"10px 0", color:st==="error"?"#fc8181":st==="done"?"#68d391":"#fbd38d", fontWeight:600 }),
};

export default function App() {
  const [status, setStatus] = useState("idle");
  const [transcript, setTranscript] = useState("");
  const [profile, setProfile] = useState(null);
  const [schemes, setSchemes] = useState([]);
  const [gemma, setGemma] = useState(null);
  const [raw, setRaw] = useState(null);
  const [tab, setTab] = useState("schemes");
  const mr = useRef(null);
  const chunks = useRef([]);

  const [manualText, setManualText] = useState("");

  const start = async () => {
    chunks.current = [];
    setStatus("recording"); setTranscript(""); setProfile(null); setSchemes([]); setGemma(null); setRaw(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mr.current = new MediaRecorder(stream);
      mr.current.ondataavailable = (e) => chunks.current.push(e.data);
      mr.current.onstop = send;
      mr.current.start();
    } catch (e) {
      console.error(e);
      alert("Could not access microphone. You can use the manual text box below!");
      setStatus("idle");
    }
  };

  const stop = () => { if (mr.current && mr.current.state === "recording") { mr.current.stop(); setStatus("processing"); } };

  const handleToggle = () => {
    if (status === "recording") {
      stop();
    } else {
      start();
    }
  };

  const send = async () => {
    try {
      const blob = new Blob(chunks.current, { type: "audio/webm" });
      const form = new FormData();
      form.append("audio", blob, "voice.webm");
      const res = await fetch(API + "/rag", { method: "POST", body: form });
      const json = await res.json();
      setRaw(json);
      if (json.success && json.data) {
        const d = json.data;
        setTranscript(d.voice?.text || "");
        setProfile(d.business_profile || null);
        setSchemes(d.retrieved_schemes || []);
        setGemma(d.gemma || null);
      }
      setStatus("done");
    } catch (e) { console.error(e); setStatus("error"); }
  };

  const sendText = async () => {
    if (!manualText.trim()) return;
    setStatus("processing"); setTranscript(manualText); setProfile(null); setSchemes([]); setGemma(null); setRaw(null);
    try {
      // Direct call to profile extraction
      const profRes = await fetch(API + "/business-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: manualText })
      });
      const profJson = await profRes.json();
      
      // Direct call to retrieve schemes
      const retRes = await fetch(API + "/retrieve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: manualText, top_k: 5 })
      });
      const retJson = await retRes.json();
      
      // Direct call to Gemma advice
      const gemmaSchemes = (retJson.data || []).map(r => ({
        scheme: r.scheme,
        benefits: r.benefits,
        documents: r.documents,
        apply_url: r.apply_url
      }));
      
      const genRes = await fetch(API + "/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: `Industry: ${profJson.data?.industry}, Revenue: ${profJson.data?.revenue}, Employees: ${profJson.data?.employees}, Need: ${profJson.data?.need}`,
          schemes: gemmaSchemes,
          question: `Suggest best eligible schemes for my business. Need: ${profJson.data?.need}`
        })
      });
      const genJson = await genRes.json();
      
      setProfile(profJson.data || null);
      setSchemes(retJson.data || []);
      setGemma(genJson.data || null);
      setRaw({
        voice: { text: manualText, language: "Manual Input", confidence: 1.0 },
        business_profile: profJson.data,
        retrieved_schemes: retJson.data,
        gemma: genJson.data
      });
      setStatus("done");
    } catch (e) {
      console.error(e);
      setStatus("error");
    }
  };

  return (
    <div style={s.body}>
      <div style={s.logo}>VyaparMitra AI</div>
      <div style={s.sub}>MSME Government Scheme Advisor - Gemma + FAISS RAG</div>

      <div style={s.card}>
        <button style={s.btn(status==="recording")} onClick={handleToggle} disabled={status==="processing"}>
          {status === "recording" ? "🔴 Click to Stop Recording" : "🎤 Click to Start Recording"}
        </button>
        
        <div style={{ margin: "20px 0", textAlign: "center", color: "#718096" }}>— OR TYPE MANUALLY —</div>
        
        <div style={{ display: "flex", gap: 10 }}>
          <input 
            type="text" 
            placeholder="e.g. I own a turmeric processing unit, revenue 2 lakh, 12 employees, need loan." 
            value={manualText} 
            onChange={(e) => setManualText(e.target.value)}
            style={{ flex: 1, padding: 12, borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(0,0,0,0.3)", color: "#fff" }}
          />
          <button onClick={sendText} disabled={status==="processing"} style={{ padding: "12px 20px", borderRadius: 8, background: "#3182ce", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer" }}>
            Submit
          </button>
        </div>

        {status !== "idle" && <div style={s.statusText(status)}>{status==="recording"?"Listening... speak now":status==="processing"?"Running RAG Pipeline...":status==="done"?"Pipeline complete!":"Something went wrong."}</div>}
        {transcript && <div style={{marginTop:12}}><div style={{color:"#a0aec0",fontSize:"0.85rem",marginBottom:4}}>Query Text:</div><div style={{background:"rgba(0,0,0,0.3)",borderRadius:8,padding:"10px 14px",fontStyle:"italic",color:"#e2e8f0"}}>"{transcript}"</div></div>}
      </div>


      {profile && (
        <div style={s.card}>
          <div style={s.sectionTitle}>Business Profile Extracted</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {Object.entries(profile).map(([k,v]) => <span key={k} style={s.badge("rgba(139,92,246,0.3)")}>{k}: <b>{String(v)}</b></span>)}
          </div>
        </div>
      )}

      {(schemes.length > 0 || gemma) && (
        <div style={{...s.card,padding:"8px 0"}}>
          <div style={{display:"flex",borderBottom:"1px solid rgba(255,255,255,0.1)",marginBottom:16}}>
            {["schemes","gemma","raw"].map((t) => (
              <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:"10px 0",background:"none",border:"none",color:tab===t?"#a78bfa":"#718096",fontWeight:tab===t?700:400,borderBottom:tab===t?"2px solid #a78bfa":"2px solid transparent",cursor:"pointer",fontSize:"0.9rem",textTransform:"capitalize"}}>
                {t==="schemes"?"Top Schemes":t==="gemma"?"Gemma Advice":"Raw JSON"}
              </button>
            ))}
          </div>
          <div style={{padding:"0 24px 16px"}}>
            {tab==="schemes" && schemes.map((sc,i) => (
              <div key={i} style={s.schCard}>
                <div style={s.row}><span style={s.badge("rgba(56,161,105,0.4)")}>{i+1}</span><strong>{sc.scheme}</strong><span style={{marginLeft:"auto",color:"#68d391",fontSize:"0.8rem"}}>Score: {(sc.score*100).toFixed(1)}%</span></div>
                <div style={{color:"#a0aec0",fontSize:"0.85rem",marginBottom:6}}>{sc.benefits}</div>
                {sc.apply_url && <a href={sc.apply_url} target="_blank" rel="noreferrer" style={{color:"#76e4f7",fontSize:"0.8rem",textDecoration:"none"}}>Apply here</a>}
              </div>
            ))}
            {tab==="gemma" && gemma && (
              <div>
                <div style={s.row}><span style={s.badge("rgba(237,137,54,0.4)")}>Priority {gemma.priority}</span><span style={s.badge("rgba(56,161,105,0.4)")}>Confidence {((gemma.confidence||0)*100).toFixed(0)}%</span></div>
                
                {gemma.eligible_schemes && gemma.eligible_schemes.length > 0 && (
                   <div style={{marginBottom:12}}>
                     <b style={{color:"#a78bfa"}}>Suggested Schemes:</b>
                     <ul style={{margin:"6px 0", color:"#e2e8f0", paddingLeft:20}}>
                       {gemma.eligible_schemes.map((s,i) => <li key={i}>{s}</li>)}
                     </ul>
                   </div>
                )}
                
                <p style={{color:"#e2e8f0",marginBottom:10}}><b>Reason:</b> {gemma.reason}</p>
                <p style={{color:"#e2e8f0",marginBottom:10}}><b>Eligibility:</b> {gemma.eligibility_explanation}</p>
                <p style={{color:"#e2e8f0",marginBottom:10}}><b>Next Step:</b> {gemma.recommended_next_step}</p>
                
                {gemma.required_documents && gemma.required_documents.length > 0 && (
                   <div style={{marginBottom:10, color:"#e2e8f0"}}><b>Documents:</b> {gemma.required_documents.join(", ")}</div>
                )}

                {gemma.application_url && <a href={gemma.application_url} target="_blank" rel="noreferrer" style={{color:"#76e4f7",textDecoration:"none"}}>Apply Now</a>}
              </div>
            )}
            {tab==="raw" && <pre style={s.pre}>{JSON.stringify(raw,null,2)}</pre>}
          </div>
        </div>
      )}
    </div>
  );
}