namespace app_abn.db;

entity Sales {
  key ID       : Integer;
      region   : String(100);
      country  : String(100);
      org      : String(4);
      amount   : Integer;
      comments : String(100);      
      items: Composition of many SalesItem on items.parent = $self;
};

entity SalesItem{
    key ID: Integer;
    product: String(40);
    quantity : Integer;
    parent : Association to Sales;
};
