// 🏢 ENGINE SERVERLESS VERCEL v3.6 — MUTLAK LOCK TIMEZONE WIB INDONESIA
const fs = require('fs');
const path = require('path');

export default function handler(req, res) {
    try {
        // 1. Sedot database master raksasa 31 MB lo di lokal server Vercel gaeesss
        const filePath = path.join(process.cwd(), 'basedata', 'trains.json');
        const fileData = fs.readFileSync(filePath, 'utf8');
        const dbTrains = JSON.parse(fileData);

        // 2. LOGIKA PENENTU SUMBU WAKTU (ANTI BENTROK TIME MANIPULATION & TIMEZONE AMERIKA)
        let currentMs;
        if (req.query.customTime) {
            // Kalo AI sebelah ngirim waktu halu/manipulasi dari browser, kita patuhi total!
            currentMs = parseInt(req.query.customTime, 10);
        } else {
            // 🇮🇩 PAKSA LOCK KE WAKTU JAKARTA (WIB / UTC+7) MAU SERVERNYA DI BELAHAN BUMI MANA PUN!
            const targetTimezoneOffset = 7 * 60 * 60 * 1000; // Selisih WIB ke UTC (7 Jam dalam Ms)
            const now = new Date();
            
            // Konversi waktu default server awang-awang murni jadi Waktu Indonesia Barat (WIB)
            const jakartaTime = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + targetTimezoneOffset);
            
            const midnight = new Date(jakartaTime.getFullYear(), jakartaTime.getMonth(), jakartaTime.getDate()).getTime();
            currentMs = jakartaTime.getTime() - midnight;
        }

        const processedLiveTrains = [];

        // 3. LOOPING & FORENSIK JALUR DINASAN 2.547 ARMADA SE-INDONESIA
        dbTrains.forEach(train => {
            if (!train.paths || train.paths.length < 2) return;

            const paths = train.paths;
            const startTime = paths[0].depart_ms;
            const endTime = paths[paths.length - 1].arriv_ms;

            // CEK: Apakah kereta ini emang lagi jam dinas dines jalan di waktu tersebut?
            if (currentMs >= startTime && currentMs <= endTime) {
                
                // Cari posisi index segment stasiun yang lagi dilewatin sekarang, bre!
                let activeIdx = -1;
                for (let i = 0; i < paths.length - 1; i++) {
                    if (currentMs >= paths[i].depart_ms && currentMs <= paths[i+1].arriv_ms) {
                        activeIdx = i;
                        break;
                    }
                }

                // Kalo ketemu segment aktifnya, bungkus datanya presisi sesuai format surat cinta AI sebelah!
                if (activeIdx !== -1) {
                    const nodeA = paths[activeIdx];
                    const nodeB = paths[activeIdx + 1];

                    // Deteksi logika ngetem gaib di stasiun
                    const isNgetem = (currentMs >= nodeA.arriv_ms && currentMs <= nodeA.depart_ms);

                    processedLiveTrains.push({
                        id: train.tr_id || train.id,
                        name: train.tr_name || train.name,
                        tr_cd: train.tr_cd || "CC",
                        status: isNgetem ? "NGETEM" : "BERJALAN",
                        relation: train.relation || "LINTAS DAOP",
                        isNgetem: isNgetem,
                        t_start: isNgetem ? nodeA.arriv_ms : nodeA.depart_ms, // waktu awal segment
                        t_end: isNgetem ? nodeA.depart_ms : nodeB.arriv_ms,   // waktu akhir segment
                        lat_a: nodeA.lat,
                        lng_a: nodeA.lng,
                        lat_b: isNgetem ? nodeA.lat : nodeB.lat, // Kalo ngetem, titik tujuan disamain biar diem
                        lng_b: isNgetem ? nodeA.lng : nodeB.lng
                    });
                }
            }
        });

        // 4. BALIKIN RESPONS RESPONSIVE SUPER ENTENG (CUMA BELASAN KB JAYA SENTOSA!)
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(processedLiveTrains);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Serverless Filter Engine Jebol, bre! 💀" });
    }
}