// 🏢 ENGINE SERVERLESS VERCEL v3.8 — AUTO-DETECT JSON FORMAT (ANTI FOR-EACH CRASH)
const fs = require('fs');
const path = require('path');

export default function handler(req, res) {
    try {
        const NAMA_FOLDER_DATA = 'basedata'; 
        const filePath = path.join(process.cwd(), NAMA_FOLDER_DATA, 'trains.json');
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: `File trains.json kagak ketemu di folder '${NAMA_FOLDER_DATA}/', bre! 💀` });
        }

        const fileData = fs.readFileSync(filePath, 'utf8');
        const parsedData = JSON.parse(fileData);

        // 🚨 AUTOMATIC ARRAY DETECTOR JALUR GAIB
        let dbTrains = [];
        if (Array.isArray(parsedData)) {
            dbTrains = parsedData; // Kalo emang udah array polos, langsung gas
        } else if (parsedData && typeof parsedData === 'object') {
            // Kalo tipenya objek, kita ulik otomatis nyari properti yang isinya array!
            const keys = Object.keys(parsedData);
            for (let key of keys) {
                if (Array.isArray(parsedData[key])) {
                    dbTrains = parsedData[key];
                    break;
                }
            }
        }

        // Kalo setelah diulik tetep gagal nemu array, keluarin baris info aman
        if (!dbTrains || dbTrains.length === 0) {
            return res.status(422).json({ error: "Struktur trains.json lo ngaco gaeess, kagak nemu Array di dalemnya! 💀" });
        }

        // 2. LOGIKA PENENTU SUMBU WAKTU WIB
        let currentMs;
        if (req.query.customTime) {
            currentMs = parseInt(req.query.customTime, 10);
        } else {
            const targetTimezoneOffset = 7 * 60 * 60 * 1000; // WIB (UTC+7)
            const now = new Date();
            const jakartaTime = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + targetTimezoneOffset);
            const midnight = new Date(jakartaTime.getFullYear(), jakartaTime.getMonth(), jakartaTime.getDate()).getTime();
            currentMs = jakartaTime.getTime() - midnight;
        }

        const processedLiveTrains = [];

        // 3. LOOPING AMAN JAYA SENTOSA LINTAS DAOP
        dbTrains.forEach(train => {
            try {
                if (!train || !train.paths || train.paths.length < 2) return;

                const paths = train.paths;
                const startTime = paths[0].depart_ms;
                const endTime = paths[paths.length - 1].arriv_ms;

                if (currentMs >= startTime && currentMs <= endTime) {
                    let activeIdx = -1;
                    for (let i = 0; i < paths.length - 1; i++) {
                        if (paths[i] && paths[i+1] && currentMs >= paths[i].depart_ms && currentMs <= paths[i+1].arriv_ms) {
                            activeIdx = i;
                            break;
                        }
                    }

                    if (activeIdx !== -1) {
                        const nodeA = paths[activeIdx];
                        const nodeB = paths[activeIdx + 1];
                        const isNgetem = (currentMs >= nodeA.arriv_ms && currentMs <= nodeA.depart_ms);

                        processedLiveTrains.push({
                            id: train.tr_id || train.id || Math.random().toString(),
                            name: train.tr_name || train.name || "KA Ghaib",
                            tr_cd: train.tr_cd || "CC",
                            status: isNgetem ? "NGETEM" : "BERJALAN",
                            relation: train.relation || "LINTAS DAOP",
                            isNgetem: isNgetem,
                            t_start: isNgetem ? nodeA.arriv_ms : nodeA.depart_ms,
                            t_end: isNgetem ? nodeA.depart_ms : nodeB.arriv_ms,
                            lat_a: nodeA.lat || 0,
                            lng_a: nodeA.lng || 0,
                            lat_b: isNgetem ? nodeA.lat : nodeB.lat || 0,
                            lng_b: isNgetem ? nodeA.lng : nodeB.lng || 0
                        });
                    }
                }
            } catch (e) {
                // Skip data corupt per gerbong kereta
            }
        });

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(processedLiveTrains);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: `Serverless Filter Engine Jebol Parah, bre! Detail: ${error.message} 💀` });
    }
}
