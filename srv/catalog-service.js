const debug = require('debug')('srv:catalog-service');
const log = require('cf-nodejs-logging-support');

log.setLoggingLevel('info');
log.registerCustomFields(["country", "amount"]);

module.exports = cds.service.impl(async function () {
    
    const s4hcso = await cds.connect.to('API_SALES_ORDER_SRV');
    const s4hcprod = await cds.connect.to('API_PRODUCT_SRV');
    const s4hcserv = await cds.connect.to('YY1_VISEO_SERVICE_CDS');

    const { 
        Sales,
        SalesOrders,
        Viseo_Service,
        Products
    } = this.entities;

    //Get HANA db sales orders and update comments field with "Exceptional!" for > 500 amount
    this.after('READ', Sales, (each) => {
        if (each.amount > 500) {
            if (each.comments === null)
                each.comments = '';
            else
                each.comments += ' ';
            each.comments += 'Exceptional!';
            debug(each.comments, {"country": each.country, "amount": each.amount});
            log.info(each.comments, {"country": each.country, "amount": each.amount});
        }
    });

    //Update HANA db with sales boost (add 250 to amount)
    this.on('boost', async req => {
        try {
            const ID = req.params[0];
            const tx = cds.tx(req);
            await tx.update(Sales)
                .with({ amount: { '+=': 250 }, comments: 'Boosted!' })
                .where({ ID: { '=': ID } })
                ;
            debug('Boosted ID:', ID);
            return {};
        } catch (err) {
            console.error(err);
            return {};
        }
    });

    //Call HANA db procedure (SP_TopSales)
    this.on('topSales', async (req) => {
        try {
            const tx = cds.tx(req);
            const results = await tx.run(`CALL "app_abn.db::SP_TopSales"(?,?)`, [req.data.amount]);
            return results;
        } catch (err) {
            console.error(err);
            return {};
        }
    });

    //Get S4Cloud Products
    this.on('READ', Products, async (req) => {
        console.log(req.query)
        try {
            const tx = s4hcprod.transaction(req);
            return await tx.send({
                query: req.query,
                headers: {
                    'Application-Interface-Key': process.env.ApplicationInterfaceKey,
                    'APIKey': process.env.APIKey
                }
            })
        } catch (err) {
            req.reject(err);
        }
    });

    //Get S4Cloud Sales Orders
    this.on('READ', SalesOrders, async (req) => {
        console.log("read sales orders !")
        try {
            const tx = s4hcso.transaction(req);
            return await tx.send({
                query: req.query,
                headers: {
                    'Application-Interface-Key': process.env.ApplicationInterfaceKey,
                    'APIKey': process.env.APIKey
                }
            })
        } catch (err) {
            req.reject(err);
        }
    });

    //Call HANA db select on Sales & join on S4HANA Sales Order
    this.on('largestOrder', Sales, async (req) => {
        try {
            const tx1 = cds.tx(req);
            const res1 = await tx1.read(Sales)
                .where({ ID: { '=': req.params[0] } })
                ;
            let cql = SELECT.one(SalesOrders).where({ SalesOrganization: res1[0].org }).orderBy({ TotalNetAmount: 'desc' });
            const tx2 = s4hcso.transaction(req);
            const res2 = await tx2.send({
                query: cql,
                headers: {
                    'Application-Interface-Key': process.env.ApplicationInterfaceKey,
                    'APIKey': process.env.APIKey
                }
            });
            if (res2) {
                return res2.SoldToParty + ' @ ' + res2.TransactionCurrency + ' ' + Math.round(res2.TotalNetAmount).toString();
            } else {
                return 'Not found';
            }
        } catch (err) {
            req.reject(err);
        }
    });


    //Get S4Cloud Service Sales Order
    this.on('READ', SalesOrders, async (req) => {
        console.log("read sales orders !")
        try {
            const tx = s4hcso.transaction(req);
            return await tx.send({
                query: req.query,
                headers: {
                    'Application-Interface-Key': process.env.ApplicationInterfaceKey,
                    'APIKey': process.env.APIKey
                }
            })
        } catch (err) {
            req.reject(err);
        }
    });

    //Get S4Cloud Service Sales Order
    this.on('READ', Viseo_Service, async (req) => {
        console.log("read Temp sales orders !")
        try {
            const tx = s4hcserv.transaction(req);
            return await tx.send({
                query: req.query,
                headers: {
                    'Application-Interface-Key': process.env.ApplicationInterfaceKey,
                    'APIKey': process.env.APIKey
                }
            })
        } catch (err) {
            req.reject(err);
        }
    });

    /*
        //Update HANA db with sales boost (add 250 to amount)
    this.on('CreatePO', async req => {
        try {
            const ID = req.params[0];
            const tx = cds.tx(req);
            await tx.update(Sales)
                .with({ amount: { '+=': 250 }, comments: 'Boosted!' })
                .where({ ID: { '=': ID } })
                ;
            debug('Boosted ID:', ID);
            return {};
        } catch (err) {
            console.error(err);
            return {};
        }
    });
*/
});