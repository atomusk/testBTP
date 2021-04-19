using {app_abn.db as db} from '../db/data-model';
using { API_SALES_ORDER_SRV } from './external/API_SALES_ORDER_SRV.csn';
using { API_PRODUCT_SRV } from './external/API_PRODUCT_SRV.csn';
using { YY1_VISEO_SERVICE_CDS } from './external/YY1_VISEO_SERVICE_CDS.csn';

service CatalogService @(path : '/catalog')
{
    entity Sales
        as select * from db.Sales
        actions {
            function largestOrder() returns String;
            action boost();
        };

    entity SalesItem
        as select * from db.SalesItem;
         
       
    function topSales
        (amount: Integer)
        returns many Sales; 

    @Capabilities.InsertRestrictions.Insertable: true
    entity SalesOrders
        as projection on API_SALES_ORDER_SRV.A_SalesOrder {
            SalesOrder,
            SalesOrganization,
            DistributionChannel,
            SoldToParty,
            IncotermsLocation1,
            TotalNetAmount,
            SalesOrderType,
            TransactionCurrency
    };

    entity Products 
        as projection on API_PRODUCT_SRV.A_Product {
            Product,
            ProductType,
            ProductGroup,
            ItemCategoryGroup,
            to_Description        
    }

 
    entity Viseo_Service 
        as projection on YY1_VISEO_SERVICE_CDS.YY1_VISEO_SERVICE {
               SAP_UUID,
               OrderID,
               SAP_Description,
               OrderUser,
               OrderStatus,
               CreationDate,
               to_Items
    }
    
    entity Viseo_Service_item 
        as projection on YY1_VISEO_SERVICE_CDS.YY1_ITEMS_VISEO_SERVICE {
               SAP_UUID,
               SAP_PARENT_UUID,
               ItemNumber,
               Product,
               quantity
    } 
};

