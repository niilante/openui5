sap.ui.require([
	"sap/ui/table/TableUtils",
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function(TableUtils, JSONModel, Device) {
	"use strict";

	var bExecuteAllTests = jQuery.sap.getUriParameters().get("sap-ui-xx-table-testall") === "true";

	var QUnit = window.QUnit;
	var oTable;
	var oTreeTable;
	var sSomeVeryLargeTextWhichMightCauseWrapping = "Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test";

	var oDataSet = {
		text: sSomeVeryLargeTextWhichMightCauseWrapping,
		date: new Date(2015, 1, 1),
		money: 1000000.99,
		percent: 50,
		rating: 3
	};

	var oData = {
		rows: [oDataSet]
	};

	oData.rows[0].rows = [oDataSet];

	var aSupportedControls = [
		new sap.m.Text({text: "{text}", wrapping: false}),
		new sap.m.Label({text: "{text}"}),
		new sap.m.ObjectStatus({title: "{text}", text: "{text}"}),
		new sap.ui.core.Icon({src: "sap-icon://account", decorative: false}),
		new sap.m.Button({text: "{text}"}),
		new sap.m.Input({value: "{text}"}),
		new sap.m.DatePicker({value: "{path: '/date', type: 'sap.ui.model.type.Date'}"}),
		new sap.m.Select({items: [new sap.ui.core.Item({key: "key", text: "{text}"})]}),
		new sap.m.ComboBox({items: [new sap.ui.core.Item({key: "key", text: "{text}"})]}),
		new sap.m.MultiComboBox({items: [new sap.ui.core.Item({key: "key", text: "{text}"})]}),
		new sap.m.CheckBox({selected: true, text: "{text}"}),
		new sap.m.Link({text: "{text}", wrapping: false}),
		new sap.ui.unified.Currency({value: "{money}", currency: "EUR"}),
		new sap.m.ProgressIndicator({percentValue: "{percent}"}),
		new sap.m.RatingIndicator({value: "{rating}"}),
		new sap.m.HBox({
			width: "100%",
			items: [
				new sap.m.Link({text: "{text}", wrapping: false}),
				new sap.m.Text({text: "{text}", wrapping: false})
			]
		}),
		new sap.m.HBox({
			width: "100%",
			items: [
				new sap.m.Button({text: "{text}"}),
				new sap.m.Button({text: "{text}"})
			]
		}),
		new sap.m.HBox({
			width: "100%",
			items: [
				new sap.m.Input({value: "{text}"}),
				new sap.m.Input({value: "{text}"})
			]
		})
	];

	var aSupportedHeaderLabelControls = [
		new sap.m.Text({text: sSomeVeryLargeTextWhichMightCauseWrapping, wrapping: false}),
		new sap.m.Label({text: sSomeVeryLargeTextWhichMightCauseWrapping}),
		new sap.m.Link({text: sSomeVeryLargeTextWhichMightCauseWrapping, wrapping: false})
	];

	var aContentDensities = [
		"sapUiSizeCozy",
		"sapUiSizeCompact",
		"sapUiSizeCondensed",
		undefined
	];

	function createTables() {
		var oModel = new JSONModel();
		oModel.setData(oData);

		oTable = new sap.ui.table.Table({
			rows: "{/rows}",
			title: "Grid Table",
			selectionMode: "MultiToggle",
			visibleRowCount: 1,
			ariaLabelledBy: "ARIALABELLEDBY",
			columns: [
				new sap.ui.table.Column({
					label: "Test",
					template: null,
					width: "30px"
				})
			]
		});

		oTreeTable = new sap.ui.table.TreeTable({
			rows: {
				path: "/rows",
				parameters: {arrayNames: ["rows"]}
			},
			title: "Tree Table",
			selectionMode: "Single",
			visibleRowCount: 1,
			ariaLabelledBy: "ARIALABELLEDBY",
			columns: [
				new sap.ui.table.Column({
					label: "Test",
					template: null,
					width: "30px"
				})
			]
		});

		oTable.setModel(oModel);
		oTreeTable.setModel(oModel);

		oTable.placeAt("content");
		oTreeTable.placeAt("content");
		sap.ui.getCore().applyChanges();
	}

	function destroyTables() {
		oTable.removeAllColumns();
		oTable.destroy();
		oTable = null;

		oTreeTable.removeAllColumns();
		oTreeTable.destroy();
		oTreeTable = null;
	}

	function setContentDensity(sContentDensity) {
		var oBody = document.getElementsByTagName("body")[0];

		// Remove the current density class.
		for (var i = 0; i < aContentDensities.length; i++) {
			if (aContentDensities[i] != null) {
				oBody.classList.remove(aContentDensities[i]);
			}
		}

		// Set the new density class.
		if (sContentDensity != null) {
			oBody.classList.add(sContentDensity);
		}
	}

	function getControlName(oControl) {
		var sName;
		var oMetadata = oControl.getMetadata();
		var sClassName = oMetadata._sClassName;
		var bHasItems = oMetadata._mAllAggregations.items != null;
		var aItemNames = [];

		if (bHasItems) {
			for (var i = 0; i < oControl.getItems().length; i++) {
				var oItem = oControl.getItems()[i];
				aItemNames.push(oItem.getMetadata()._sClassName);
			}
		}

		sName = sClassName;
		if (aItemNames.length > 0) {
			sName += "[" + aItemNames.join(",") + "]";
		}

		return sName;
	}

	function getElementHeight(oElement) {
		var iHeight = oElement.getBoundingClientRect().height;

		// IE, Edge and PhantomJS can return float values. We need integers.
		if (Device.browser.msie || Device.browser.edge || Device.browser.phantomJS) {
			iHeight = Math.round(iHeight);
		}

		return iHeight;
	}

	QUnit.module("Default Row Height", {
		beforeEach: function() {
			createTables();
		},
		afterEach: function() {
			destroyTables();
		},
		assertRowHeights: function(assert, oTable, bHeader) {
			if (bHeader == null) {
				bHeader = false;
			}

			for (var i = 0; i < aContentDensities.length; i++) {
				var sContentDensity = aContentDensities[i];

				setContentDensity(sContentDensity);

				for (var j = 0; j < aSupportedControls.length; j++) {
					var oControl = aSupportedControls[j];
					var sControlName = getControlName(oControl);

					oTable.getColumns()[0][bHeader ? "setLabel" : "setTemplate"](oControl);
					sap.ui.getCore().applyChanges();

					var iActualRowHeight = getElementHeight(oTable[bHeader ? "getColumns" : "getRows"]()[0].getDomRef());

					if (bHeader) {
						this._assertHeaderRowHeight(assert, iActualRowHeight, sContentDensity, sControlName);
					} else {
						this._assertContentRowHeight(assert, iActualRowHeight, sContentDensity, sControlName);
					}
				}
			}
		},
		_assertHeaderRowHeight: function(assert, iActualRowHeight, sContentDensity, sControlName) {
			var iExpectedRowHeight = TableUtils.DEFAULT_ROW_HEIGHT[sContentDensity];

			assert.strictEqual(iActualRowHeight, iExpectedRowHeight,
				"Density: " + sContentDensity
				+ ", Control: " + sControlName
				+ " - The header row has the default height (" + iExpectedRowHeight + "px)"
			);
		},
		_assertContentRowHeight: function(assert, iActualRowHeight, sContentDensity, sControlName) {
			var iExpectedRowHeight = TableUtils.DEFAULT_ROW_HEIGHT[sContentDensity];

			if (Device.browser.phantomJS) {
				this._assertContentRowHeightInCrappyPhantomJS(assert, iActualRowHeight, iExpectedRowHeight, sContentDensity, sControlName);
				return;
			}

			if (sContentDensity != null) {
				assert.strictEqual(iActualRowHeight, iExpectedRowHeight,
					"Density: " + sContentDensity
					+ ", Control: " + sControlName
					+ " - The row has the default height (" + iExpectedRowHeight + "px)"
					+ " (Actual height: " + iActualRowHeight + "px)"
				);
			} else {
				var iMaxDefaultRowHeight = TableUtils.DEFAULT_ROW_HEIGHT[aContentDensities[0]]; // sapUiSizeCozy

				assert.ok(
					iActualRowHeight >= iExpectedRowHeight && iActualRowHeight <= iMaxDefaultRowHeight,
					"Density: " + sContentDensity
					+ ", Control: " + sControlName
					+ " - The row has at least the default height of " + iExpectedRowHeight + "px"
					+ " and not more than the maximum default row height of " + iMaxDefaultRowHeight + "px"
					+ " (Actual height: " + iActualRowHeight + "px)"
				);
			}
		},
		_assertContentRowHeightInCrappyPhantomJS: function(assert, iActualRowHeight, iExpectedRowHeight, sContentDensity, sControlName) {
			if (!Device.browser.phantomJS) {
				return;
			}

			var iPhantomJSRowHeight = null;
			var iMaxDefaultRowHeight = TableUtils.DEFAULT_ROW_HEIGHT[aContentDensities[0]]; // sapUiSizeCozy;

			switch (sContentDensity) {
				case "sapUiSizeCozy":
					switch (sControlName) {
						case "sap.m.ProgressIndicator":
							iPhantomJSRowHeight = 60;
							break;
						case "sap.m.HBox[sap.m.Button,sap.m.Button]":
						case "sap.m.HBox[sap.m.Input,sap.m.Input]":
							iPhantomJSRowHeight = 68;
							break;
						default:
					}
					break;
				case "sapUiSizeCompact":
					switch (sControlName) {
						case "sap.m.ObjectStatus":
							iPhantomJSRowHeight = 39;
							break;
						case "sap.m.ProgressIndicator":
							iPhantomJSRowHeight = 46;
							break;
						case "sap.m.HBox[sap.m.Link,sap.m.Text]":
							iPhantomJSRowHeight = 41;
							break;
						case "sap.m.HBox[sap.m.Button,sap.m.Button]":
						case "sap.m.HBox[sap.m.Input,sap.m.Input]":
							iPhantomJSRowHeight = 52;
							break;
						default:
					}
					break;
				case "sapUiSizeCondensed":
					switch (sControlName) {
						case "sap.ui.unified.Currency":
							iPhantomJSRowHeight = 26;
							break;
						case "sap.m.Text":
						case "sap.m.Label":
						case "sap.m.Link":
							iPhantomJSRowHeight = 28;
							break;
						case "sap.m.ObjectStatus":
						case "sap.m.ProgressIndicator":
							iPhantomJSRowHeight = 49;
							break;
						case "sap.m.HBox[sap.m.Link,sap.m.Text]":
							iPhantomJSRowHeight = 50;
							break;
						case "sap.m.HBox[sap.m.Button,sap.m.Button]":
						case "sap.m.HBox[sap.m.Input,sap.m.Input]":
							iPhantomJSRowHeight = 47;
							break;
						default:
					}
					break;
				case undefined:
					switch (sControlName) {
						case "sap.m.ProgressIndicator":
							iPhantomJSRowHeight = 60;
							break;
						case "sap.m.HBox[sap.m.Button,sap.m.Button]":
						case "sap.m.HBox[sap.m.Input,sap.m.Input]":
							iPhantomJSRowHeight = 68;
							break;
						default:
					}
					break;
				default:
			}

			var sTestParameters = "Density: " + sContentDensity + ", Control: " + sControlName;
			var sPhantomJSInfo = "Please run these tests in all supported browsers to verify."
								   + " In case the tests fail only in PhantomJS please contact the sap.ui.table responsibles.";

			if (sContentDensity != null) {
				if (iPhantomJSRowHeight === null) {
					assert.strictEqual(iActualRowHeight, iExpectedRowHeight,
						sTestParameters
						+ " - The row has the default height (" + iExpectedRowHeight + "px)"
						+ " (Actual height: " + iActualRowHeight + "px)"
						+ " - " + sPhantomJSInfo
					);
				} else {
					assert.ok(
						iActualRowHeight >= iExpectedRowHeight && iActualRowHeight <= iPhantomJSRowHeight,
						sTestParameters
						+ " - The row has the default height (" + iExpectedRowHeight + "px)"
						+ " or the PhantomJS specific height for this control (" + iPhantomJSRowHeight + "px)"
						+ " (Actual height: " + iActualRowHeight + "px)"
						+ " - " + sPhantomJSInfo
					);
				}
			} else if (iPhantomJSRowHeight === null) {
				assert.ok(
					iActualRowHeight >= iExpectedRowHeight && iActualRowHeight <= iMaxDefaultRowHeight,
					sTestParameters
					+ " - The row has at least the default height of " + iExpectedRowHeight + "px"
					+ " and not more than the maximum default row height of " + iMaxDefaultRowHeight + "px"
					+ " (Actual height: " + iActualRowHeight + "px)"
					+ " - " + sPhantomJSInfo
				);
			} else {
				assert.ok(
					iActualRowHeight >= iExpectedRowHeight && iActualRowHeight <= iPhantomJSRowHeight,
					sTestParameters
					+ " - The row has at least the default height of " + iExpectedRowHeight + "px"
					+ " and not more than the PhantomJS specific maximum row height of " + iPhantomJSRowHeight + "px for this control"
					+ " (Actual height: " + iActualRowHeight + "px)"
					+ " - " + sPhantomJSInfo
				);
			}
		}
	});

	if (bExecuteAllTests) {
		QUnit.test("Table - Header Row", function(assert) {
			this.assertRowHeights(assert, oTable, true);
		});
	}

	QUnit.test("Table - Content Row", function(assert) {
		this.assertRowHeights(assert, oTable);
	});

	QUnit.test("Table - Group Header Row", function(assert) {
		oTable.setEnableGrouping(true);
		oTable.setGroupBy(oTable.getColumns()[0]);
		this.assertRowHeights(assert, oTable);
	});

	QUnit.test("TreeTable - Content Row in TreeMode", function(assert) {
		this.assertRowHeights(assert, oTreeTable);
	});

	QUnit.test("TreeTable - Content Row in GroupMode", function(assert) {
		oTreeTable.setUseGroupMode(true);
		this.assertRowHeights(assert, oTreeTable);
	});

	if (bExecuteAllTests) {
		QUnit.module("Vertical Position", {
			beforeEach: function() {
				createTables();
			},
			afterEach: function() {
				destroyTables();
			}
		});

		QUnit.test("Table - Header Cell", function(assert) {
			for (var i = 0; i < aContentDensities.length; i++) {
				var sContentDensity = aContentDensities[i];

				setContentDensity(sContentDensity);

				for (var j = 0; j < aSupportedHeaderLabelControls.length; j++) {
					var oControl = aSupportedHeaderLabelControls[j];
					var sControlName = getControlName(oControl);

					oTable.getColumns()[0].setLabel(oControl);
					sap.ui.getCore().applyChanges();

					var iRowHeight = getElementHeight(oTable.getColumns()[0].getDomRef().parentElement);
					var oCellContent = oTable.getColumns()[0].getLabel().getDomRef();
					var iShift = Math.floor(((iRowHeight - 1) - (oCellContent.offsetTop * 2 + getElementHeight(oCellContent))) / 2);
					var sPositionState = "";

					// Zero shift -> The element is centered. Note: The content of the element could still be misaligned inside the element itself.
					// Positive shift -> The center of the element is above the center of the cell.
					// Negative shift -> The center of the element is below the center of the cell.
					if (iShift > 0) {
						sPositionState = "too high";
					} else if (iShift < 0) {
						sPositionState = "too low";
					}

					assert.strictEqual(iShift, 0,
						"Density: " + sContentDensity
						+ ", Control: " + sControlName
						+ " - The content of the header cell is centered vertically"
						+ " (Shift: " + iShift + "px" + (iShift !== 0 ? " " + sPositionState : "") + ")"
					);
				}
			}
		});

		QUnit.test("Table - Content Cell", function(assert) {
			for (var i = 0; i < aContentDensities.length; i++) {
				var sContentDensity = aContentDensities[i];

				setContentDensity(sContentDensity);

				for (var j = 0; j < aSupportedControls.length; j++) {
					var oControl = aSupportedControls[j];
					var sControlName = getControlName(oControl);

					oTable.getColumns()[0].setTemplate(oControl);
					sap.ui.getCore().applyChanges();

					var iRowHeight = getElementHeight(oTable.getRows()[0].getDomRef());
					var oCellContent = oTable.getRows()[0].getCells()[0].getDomRef();
					var iShift = Math.floor(((iRowHeight - 1) - (oCellContent.offsetTop * 2 + getElementHeight(oCellContent))) / 2);
					var sPositionState = "";

					// Zero shift -> The element is centered. Note: The content of the element could still be misaligned inside the element itself.
					// Positive shift -> The center of the element is above the center of the cell.
					// Negative shift -> The center of the element is below the center of the cell.
					if (iShift > 0) {
						sPositionState = "too high";
					} else if (iShift < 0) {
						sPositionState = "too low";
					}

					assert.strictEqual(iShift, 0,
						"Density: " + sContentDensity
						+ ", Control: " + sControlName
						+ " - The content of the cell is centered vertically"
						+ " (Shift: " + iShift + "px" + (iShift !== 0 ? " " + sPositionState : "") + ")"
					);
				}
			}
		});

		QUnit.test("TreeTable - Content Cell", function(assert) {
			for (var i = 0; i < aContentDensities.length; i++) {
				var sContentDensity = aContentDensities[i];

				setContentDensity(sContentDensity);

				for (var j = 0; j < aSupportedControls.length; j++) {
					var oControl = aSupportedControls[j];
					var sControlName = getControlName(oControl);

					oTreeTable.getColumns()[0].setTemplate(oControl);
					sap.ui.getCore().applyChanges();

					var iRowHeight = getElementHeight(oTreeTable.getRows()[0].getDomRef());
					var oCellContent = oTreeTable.getRows()[0].getCells()[0].getDomRef();
					var iShift = Math.floor(((iRowHeight - 1) - (oCellContent.offsetTop * 2 + getElementHeight(oCellContent))) / 2);
					var sPositionState = "";

					// Zero shift -> The element is centered. Note: The content of the element could still be misaligned inside the element itself.
					// Positive shift -> The center of the element is above the center of the cell.
					// Negative shift -> The center of the element is below the center of the cell.
					if (iShift > 0) {
						sPositionState = "too high";
					} else if (iShift < 0) {
						sPositionState = "too low";
					}

					assert.strictEqual(iShift, 0,
						"Density: " + sContentDensity
						+ ", Control: " + sControlName
						+ " - The content of the cell is centered vertically"
						+ " (Shift: " + iShift + "px" + (iShift !== 0 ? " " + sPositionState : "") + ")"
					);
				}
			}
		});
	}

	//// Simplify access in the browser console.
	//window.createTables = function() {
	//	createTables();
	//	window.oTable = oTable;
	//	window.oTreeTable = oTreeTable;
	//};
	//window.destroyTables = function() {
	//	destroyTables();
	//	window.oTable = oTable;
	//	window.oTreeTable = oTreeTable;
	//};
});