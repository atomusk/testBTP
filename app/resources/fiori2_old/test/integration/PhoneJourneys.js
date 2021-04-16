sap.ui.define([
	"sap/ui/test/Opa5",
	"./arrangements/Startup",
	"./arrangements/FLP",
	"./NavigationJourneyPhone",
	"./NotFoundJourneyPhone",
	"./BusyJourneyPhone"
], function (Opa5, Startup, FLP) {
	"use strict";

	Opa5.extendConfig({
		arrangements: new Startup(),
		assertions: new FLP(),
		viewNamespace: "ns.app_abn.view.",
		autoWait: true
	});
});
