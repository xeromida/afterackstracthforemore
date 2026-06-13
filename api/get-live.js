// 🏢 ENGINE ULTIMATE SERVERLESS v5.0 — MONGODB BYPASS ALL FILTER IMMORTAL EDITION
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

        // 🟢 ANTENA MAIN: RADAR BYPASS TOTAL (PAKSA LOAD SEMUA TANPA FILTER WAKTU!)
        // Tarik semua dokumen trains tanpa saringan birokrasi dari cloud Mongo
        const allTrainsFromCloud = await db.collection('trains').find({}).toArray();
        await client.close();

        const processedLiveTrains = [];

        allTrainsFromCloud.forEach(train => {
            try {
                // Taktik Bypass Total: Cari array paths pembungkus koordinat
                // Mendukung variasi format paths / PATHS / data lintas
                const paths = train.paths || train.PATHS || train.station_lists;
                if (!paths || paths.length < 1) return;

                // Ambil titik koordinat default (titik awal A dan titik akhir B)
                const nodeA = paths[0];
                const nodeB = paths[1] || paths[0];

                // Ambil lat/lng secara brutal (mendukung properti lat, latitude, lng, longitude)
                const latA = nodeA.lat || nodeA.latitude || 0;
                const lngA = nodeA.lng || nodeA.longitude || 0;
                const latB = nodeB.lat || nodeB.latitude || latA;
                const lngB = nodeB.lng || nodeB.longitude || lngA;

                processedLiveTrains.push({
                    id: train._id || train.tr_id || train.id || Math.random().toString(),
                    name: train.tr_name || train.name || "KA Premium Lintas",
                    tr_cd: train.tr_cd || train.code || "CC",
                    status: "BERJALAN",
                    relation: train.relation || train.route_name || "LINTAS DAOP",
                    isNgetem: false,
                    t_start: 0,
                    t_end: 999999999,
                    lat_a: latA,
                    lng_a: lngA,
                    lat_b: latB,
                    lng_b: lngB
                });
            } catch (e) {
                // Skip gerbong corrupt
            }
        });

        return res.status(200).json(processedLiveTrains);

    } catch (error) {
        if (client) await client.close();
        console.error(error);
        return res.status(500).json({ error: `Serverless Cloud v5.0 Jebol, bre! Detail: ${error.message} 💀` });
    }
}
