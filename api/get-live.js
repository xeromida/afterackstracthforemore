// 🏢 ENGINE ULTIMATE SERVERLESS v4.5 — FULL MONGODB ALL-IN-ONE DRIVEN JALUR PREMAN
const { MongoClient } = require('mongodb');

// 🚨 PASTIIN SUBDOMAIN CLUSTER SAKRAL LO UDAH BENER SESUAI AKUN LO GAEESSS!
const uri = "mongodb+srv://joyo:tambun123@cluster0.59sghhz.mongodb.net/pusdalop?appName=Cluster0";
let cachedClient = null;

async function connectToDatabase() {
    if (cachedClient) return cachedClient;
    const client = new MongoClient(uri);
    await client.connect();
    cachedClient = client;
    return client;
}

export default async function handler(req, res) {
    // Jalur Bypass CORS biar aman sentosa lintas semesta
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    try {
        const client = await connectToDatabase();
        const db = client.db('pusdalop');

        // 🟢 ANTENA 1: FETCH DATA INFRASTRUKTUR STASIUN LANGSUNG DARI CLOUD MONGO
        if (req.query.type === 'stations') {
            const stations = await db.collection('stations').find({}).toArray();
            return res.status(200).json(stations);
        }

        // 🟢 ANTENA 2: FETCH DATA GEOMETRI JARINGAN REL LANGSUNG DARI CLOUD MONGO
        if (req.query.type === 'routes') {
            const routes = await db.collection('routes').find({}).toArray();
            // Otomatis balikin format objek dinamis biar index.html gak pusing nge-parse
            const routesObj = {};
            routes.forEach(r => {
                const id = r.id || Object.keys(r).find(k => k !== '_id');
                if (id) routesObj[id] = r[id] || r;
            });
            return res.status(200).json(routesObj);
        }

        // 🟢 ANTENA MAIN: DETEKTOR REALTIME KERETA LIVE
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

        // Taktik Kueri Badak: MongoDB cloud yang disuruh kerja keras nyaring data gerbong!
        const activeTrainsFromCloud = await db.collection('trains').find({
            "paths.0.depart_ms": { $lte: currentMs },
            $expr: {
                $gte: [
                    { $arrayElemAt: ["$paths.arriv_ms", -1] },
                    currentMs
                ]
            }
        }).toArray();

        const processedLiveTrains = [];

        activeTrainsFromCloud.forEach(train => {
            try {
                const paths = train.paths;
                if (!paths || paths.length < 2) return;

                let activeIdx = -1;
                for (let i = 0; i < paths.length - 1; i++) {
                    if (currentMs >= paths[i].depart_ms && currentMs <= paths[i+1].arriv_ms) {
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
            } catch (e) {}
        });

        return res.status(200).json(processedLiveTrains);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: `Serverless Cloud Engine v4.5 Jebol, bre! Detail: ${error.message} 💀` });
    }
}
