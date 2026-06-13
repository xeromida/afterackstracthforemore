// 🏢 ENGINE ULTIMATE SERVERLESS v4.6 — MONGODB FORCE LOAD REALTIME EDITION
const { MongoClient } = require('mongodb');

// 🚨 PASTIIN LINK MANTRA CLUSTER ASLI LO UDAH BENER YA SEPUH!
const uri = "mongodb+srv://joyo:tambun123@cluster0.59sghhz.mongodb.net/pusdalop?appName=Cluster0";

export default async function handler(req, res) {
    // Jalur Bypass CORS biar aman sentosa lintas semesta
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    let client = null;
    try {
        // Anti-Nyangkut: Buka koneksi fresh tiap ketukan biar realtime gila-gilaan!
        client = new MongoClient(uri);
        await client.connect();
        const db = client.db('pusdalop');

        // 🟢 ANTENA 1: FETCH DATA INFRASTRUKTUR STASIUN
        if (req.query.type === 'stations') {
            const stations = await db.collection('stations').find({}).toArray();
            await client.close();
            return res.status(200).json(stations);
        }

        // 🟢 ANTENA 2: FETCH DATA GEOMETRI JARINGAN REL
        if (req.query.type === 'routes') {
            const routes = await db.collection('routes').find({}).toArray();
            const routesObj = {};
            routes.forEach(r => {
                const id = r.id || Object.keys(r).find(k => k !== '_id');
                if (id) routesObj[id] = r[id] || r;
            });
            await client.close();
            return res.status(200).json(routesObj);
        }

        // 🟢 ANTENA MAIN: RUNNING RADAR KERETA REALTIME LINTAS DAOP
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

        // ⚡ TAKTIK BRUTAL FLUSH: Tarik SEMUA data dokumen trains dari Mongo tanpa filter kaku!
        const allTrainsFromCloud = await db.collection('trains').find({}).toArray();
        
        // Tutup koneksi Mongo biar gak bengkak concurrent limit-nya
        await client.close();

        const processedLiveTrains = [];

        // Filter realtime akurat dikerjakan kilat di memori serverless
        allTrainsFromCloud.forEach(train => {
            try {
                const paths = train.paths;
                if (!paths || paths.length < 2) return;

                const startTime = paths[0].depart_ms || paths[0].arriv_ms;
                const endTime = paths[paths.length - 1].arriv_ms || paths[paths.length - 1].depart_ms;

                // Cek paksa: Apakah kereta ini emang beneran lagi dines di jam tersebut?
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
                // Skip data corrupt per gerbong
            }
        });

        return res.status(200).json(processedLiveTrains);

    } catch (error) {
        if (client) await client.close();
        console.error(error);
        return res.status(500).json({ error: `Serverless Cloud Engine v4.6 Jebol, bre! Detail: ${error.message} 💀` });
    }
}
