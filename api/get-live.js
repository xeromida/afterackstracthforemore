// 🏢 ENGINE ULTIMATE SERVERLESS v4.8 — MONGODB GOOGLE CLOUD JAKARTA EDITION
const { MongoClient } = require('mongodb');

// 🚨 PASTIIN LINK MANTRA CLUSTER ASLI LO UDAH BENER YA SEPUH!
const uri = "mongodb+srv://joyo:tambun123@cluster0.59sghhz.mongodb.net/pusdalop?appName=Cluster0";

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    let client = null;
    try {
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

        // 🟢 ANTENA MAIN: RUNNING RADAR KERETA REALTIME (NATIVE JAKARTA TIMEZONE)
        let currentMs;
        if (req.query.customTime) {
            currentMs = parseInt(req.query.customTime, 10);
        } else {
            // KHUSUS SERVER JAKARTA: Langsung ambil jam lokal OS tanpa utak-atik rumus GMT!
            const jakartaTime = new Date(); 
            currentMs = (jakartaTime.getHours() * 3600000) + (jakartaTime.getMinutes() * 60000) + (jakartaTime.getSeconds() * 1000);
        }

        // Tarik semua dokumen trains tanpa filter kaku dari cloud Mongo
        const allTrainsFromCloud = await db.collection('trains').find({}).toArray();
        await client.close();

        const processedLiveTrains = [];

        allTrainsFromCloud.forEach(train => {
            try {
                const paths = train.paths;
                if (!paths || paths.length < 2) return;

                // Cari index segmen aktif murni berdasarkan titik milidetik saat ini
                let activeIdx = -1;
                for (let i = 0; i < paths.length - 1; i++) {
                    if (currentMs >= paths[i].depart_ms && currentMs <= paths[i+1].arriv_ms) {
                        activeIdx = i;
                        break;
                    }
                }

                // Toleransi detikan geser: Force attach ke segmen pertama jika masih di rentang dinas
                if (activeIdx === -1) {
                    const firstDep = paths[0].depart_ms;
                    const lastArr = paths[paths.length - 1].arriv_ms;
                    if (currentMs >= firstDep && currentMs <= lastArr) {
                        activeIdx = 0; 
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
        if (client) await client.close();
        console.error(error);
        return res.status(500).json({ error: `Serverless Jakarta Cloud Engine Jebol, bre! Detail: ${error.message} 💀` });
    }
}
