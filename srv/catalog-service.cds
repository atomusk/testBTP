using {app_abn.db as db} from '../db/data-model';

using { API_SALES_ORDER_SRV } from './external/API_SALES_ORDER_SRV.csn';



service CatalogService @(path : '/catalog')
{
    entity Sales
      as select * from db.Sales
      actions {
        function largestOrder() returns String;
        action boost();
      }
    ;

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




};
