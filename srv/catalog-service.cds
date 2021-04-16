using {app_abn.db as db} from '../db/data-model';
using { API_SALES_ORDER_SRV } from './external/API_SALES_ORDER_SRV.csn';
using { API_PRODUCT_SRV } from './external/API_PRODUCT_SRV.csn';

service CatalogService @(path : '/catalog')
{
    entity Sales
        as select * from db.Sales
        actions {
            function largestOrder() returns String;
            action boost();
        };

    function topSales
        (amount: Integer)
        returns many Sales;

    @readonly
    entity SalesOrders
        as projection on API_SALES_ORDER_SRV.A_SalesOrder {
            SalesOrder,
            SalesOrganization,
            DistributionChannel,
            SoldToParty,
            IncotermsLocation1,
            TotalNetAmount,
            TransactionCurrency
    };

    @readonly
    entity Products 
        as projection on API_PRODUCT_SRV.A_Product {
            Product,
            ProductType,
            ProductGroup,
            ItemCategoryGroup        
    }

        
};

