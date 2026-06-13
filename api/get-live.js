// 🏢 ENGINE SERVERLESS VERCEL v3.7 — SUPREME ANTI-JEBOL DEFENSIVE EDITION
const fs = require('fs');
const path = require('path');

export default function handler(req, res) {
    try {
        // 🚨 CONFIG: PASTIIN NAMA FOLDER DI SINI SAMA KAYA DI GITHUB LU (database atau basedata)
        const NAMA_FOLDER_DATA = 'basedata'; 

        const filePath = path.join(process.cwd(), NAMA_FOLDER_DATA, 'trains.json');
        
        // Cek fisik file dulu di server biar gak crash ghaib
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: `File trains.json kagak ketemu di folder '${NAMA_FOLDER_DATA}/', bre! 💀` });
        }

        const fileData = fs.readFileSync(filePath, 'utf8');
        const dbTrains = JSON.parse(fileData);

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

        // 3. LOOPING AMAN DENGAN PERTAHANAN LAPIS BAJA
        dbTrains.forEach(train => {
            try {
                // Skip kalo objek keretanya rusak atau kagak ada data rute paths-nya, gaeesss
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
            // Kalo ada 1 baris data kereta corupt, skip gaeess, jangan bikin mati se-Indonesia!
            console.error("Ada kereta eror, skip gaeess:", e);
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
