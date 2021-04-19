sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"../model/formatter",
	"sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment"
], function (BaseController, JSONModel, History, formatter, Filter, FilterOperator, Fragment) {
	"use strict";

	return BaseController.extend("app_abn-fiori3.controller.Worklist", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit : function () {
			var oViewModel;

			// keeps the search state
			this._aTableSearchState = [];

			// Model used to manipulate control states
			oViewModel = new JSONModel({
				worklistTableTitle : this.getResourceBundle().getText("worklistTableTitle"),
				saveAsTileTitle: this.getResourceBundle().getText("saveAsTileTitle", this.getResourceBundle().getText("worklistViewTitle")),
				shareOnJamTitle: this.getResourceBundle().getText("worklistTitle"),
				shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
				shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
                tableNoDataText : this.getResourceBundle().getText("tableNoDataText"),
                selectedSalesOrder: []
			});
			this.setModel(oViewModel, "worklistView");

			// Add the worklist page to the flp routing history
			this.addHistoryEntry({
				title: this.getResourceBundle().getText("worklistViewTitle"),
				icon: "sap-icon://table-view",
				intent: "#SalesOrder-manage"
			}, true);
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Triggered by the table's 'updateFinished' event: after new table
		 * data is available, this handler method updates the table counter.
		 * This should only happen if the update was successful, which is
		 * why this handler is attached to 'updateFinished' and not to the
		 * table's list binding's 'dataReceived' method.
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public
		 */
		onUpdateFinished : function (oEvent) {
			// update the worklist's object counter after the table update
			var sTitle,
				oTable = oEvent.getSource(),
				iTotalItems = oEvent.getParameter("total");
			// only update the counter if the length is final and
			// the table is not empty
			if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
				sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
			} else {
				sTitle = this.getResourceBundle().getText("worklistTableTitle");
			}
			this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
		},

		/**
		 * Event handler when a table item gets pressed
		 * @param {sap.ui.base.Event} oEvent the table selectionChange event
		 * @public
		 */
		onPress : function (oEvent) {
            
            var oViewModel = this.getModel("basket");
            var mNewItem = oEvent.getSource().getBindingContext().getObject();

            var aItems = oViewModel.getProperty("/items");
            aItems.push(mNewItem);

            var oButton = this.byId("approveButton");
            var oButtonBadgeCustomData = oButton.getBadgeCustomData();

            oViewModel.setProperty("/badgeCount", aItems.length)            
            oViewModel.setProperty("/badgeVisible", aItems.length !== 0)


            oButtonBadgeCustomData.setValue(aItems.length.toString());
            
		},

        onApprovePress: function(oEvent) {
//            var oButton = oEvent.getSource();
//            var oView = this.getView();
            
            //API Key for API Sandbox
            var oModel = this.getModel("worklistView");
            var oSelectedSO = this.getView().byId("table").getSelectedItems();
            oModel.setProperty("/selectedSalesOrder", oSelectedSO);
            var oBinding = this.getModel().bindList("/SalesOrders");

            var oData = [];
            var oContext;            
            var current_date = this._formatDate(new Date());

            oSelectedSO.forEach(function(SO){
                oData = {
                    "SalesOrderType": "OR",
                    "SalesOrganization": "1710",
                    "DistributionChannel": "10",
                    "OrganizationDivision": "00",
                    "SoldToParty": "17100012",
                    "PurchaseOrderByCustomer": SO.SAP_Description,
                    "SalesOrderDate": current_date,
                    "TransactionCurrency": "EUR",
                    "SDDocumentReason": "",
                    "PricingDate": current_date,
                    "PriceDetnExchangeRate": "1.00000",
                    "RequestedDeliveryDate": current_date,
                    "ShippingCondition": "01",
                    "CompleteDeliveryIsDefined": false,
                    "IncotermsClassification": "CFR",
                    "IncotermsTransferLocation": "Palo Alto",
                    "IncotermsLocation1": "Palo Alto",
                    "CustomerPaymentTerms": "0002",
                    "CustomerAccountAssignmentGroup": "01",
                    "AccountingExchangeRate": "0.00000",
                    "CustomerGroup": "01",
                    "SlsDocIsRlvtForProofOfDeliv": false,
                    "to_Item": [
                        {
                            "SalesOrderItem": "10",
                            "HigherLevelItem": "0",
                            "SalesOrderItemCategory": "TAN",
                            "SalesOrderItemText": "Trad.Good 12,Reorder Point,Reg.Trad.",
                            "PurchaseOrderByCustomer": "test2",
                            "PurchaseOrderByShipToParty": "",
                            "Material": "TG12",
                            "PricingDate": current_date,
                            "RequestedQuantity": "3",
                            "RequestedQuantityUnit": "PC",
                            "RequestedQuantitySAPUnit": "ST",
                            "RequestedQuantityISOUnit": "PCE",
                            "ItemWeightSAPUnit": "KG",
                            "ItemWeightISOUnit": "KGM",
                            "ItemVolumeSAPUnit": "M3",
                            "ItemVolumeISOUnit": "MTQ",
                            "MaterialGroup": "L001",
                            "ProductionPlant": "1710",
                            "StorageLocation": "",
                            "DeliveryGroup": "0",
                            "ShippingPoint": "1710",
                            "DeliveryPriority": "2",
                            "IncotermsClassification": "CFR",
                            "IncotermsTransferLocation": "Palo Alto",
                            "IncotermsLocation1": "Palo Alto",
                            "ProductTaxClassification1": "1",
                            "MatlAccountAssignmentGroup": "01",
                            "CustomerPaymentTerms": "0002",
                            "FixedValueDate": null,
                            "CustomerGroup": "01",
                            "SlsDocIsRlvtForProofOfDeliv": false,
                            "ProfitCenter": "YB700"
                        }
                    ],
                    "to_Partner": [
                        {
                            "PartnerFunction": "SP",
                            "Customer": "17100012",
                            "Supplier": "",
                            "Personnel": "0",
                            "ContactPerson": "0"
                        }
                    ]
                };

                oContext = oBinding.create(oData);    
                oContext.created().then(function() {
                    console.log("ok !!")
                }.bind(this));
            });

        },

		/**
		 * Event handler when the share in JAM button has been clicked
		 * @public
		 */
		onShareInJamPress : function () {
			var oViewModel = this.getModel("worklistView"),
				oShareDialog = sap.ui.getCore().createComponent({
					name: "sap.collaboration.components.fiori.sharing.dialog",
					settings: {
						object:{
							id: location.href,
							share: oViewModel.getProperty("/shareOnJamTitle")
						}
					}
				});
			oShareDialog.open();
		},

		onSearch : function (oEvent) {
			if (oEvent.getParameters().refreshButtonPressed) {
				// Search field's 'refresh' button has been pressed.
				// This is visible if you select any master list item.
				// In this case no new search is triggered, we only
				// refresh the list binding.
				this.onRefresh();
			} else {
				var aTableSearchState = [];
				var sQuery = oEvent.getParameter("query");

				if (sQuery && sQuery.length > 0) {
					aTableSearchState = [new Filter("Viseo_Service", FilterOperator.Contains, sQuery)];
				}
				this._applySearch(aTableSearchState);
			}

		},

		/**
		 * Event handler for refresh event. Keeps filter, sort
		 * and group settings and refreshes the list binding.
		 * @public
		 */
		onRefresh : function () {
			var oTable = this.byId("table");
			oTable.getBinding("items").refresh();
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Shows the selected item on the object page
		 * On phones a additional history entry is created
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
		_showObject : function (oItem) {
			var that = this;

			oItem.getBindingContext().requestCanonicalPath().then(function (sObjectPath) {
				that.getRouter().navTo("object", {
					objectId_Old: oItem.getBindingContext().getProperty("SalesOrder"),
					objectId : sObjectPath.slice("/SalesOrder".length) // /Products(3)->(3)
				});
			});
		},

		/**
		 * Internal helper method to apply both filter and search state together on the list binding
		 * @param {sap.ui.model.Filter[]} aTableSearchState An array of filters for the search
		 * @private
		 */
		_applySearch: function(aTableSearchState) {
			var oTable = this.byId("table"),
				oViewModel = this.getModel("worklistView");
			oTable.getBinding("items").filter(aTableSearchState, "Application");
			// changes the noDataText of the list in case there are no filter results
			if (aTableSearchState.length !== 0) {
				oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
			}
        },
        

        _formatDate: function(date) {            
            var year = date.getFullYear();
            var day = date.getDay();
            var month = date.getMonth();
            
            if(day < 10){
                day = "0" + day;
            }

            if(month < 10 ){
                day = "0" + month;
            }
            
            return year + '-' + month + '-' + day;
        }
        
	});
});