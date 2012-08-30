/**
 * Mailvelope - secure email with OpenPGP encryption for Webmail
 * Copyright (C) 2012  Thomas Oberndörfer
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License version 3
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

(function() {
  
  var keyGridColumns = [
      {
        field: "type",
        title: " ",
        width: 30,
        template: '<img src="../../img/#= type #-key.png" alt="#= type #" />'
      },
      {
        field: "name",
        title: "Name"
      },
      {
        field: "email",
        title: "Email"
      },
      {
        field: "id",
        width: 150,
        title: "Key ID"
      },  
      {
        field: "crDate",
        width: 90,
        title: "Creation",
        template: '#= kendo.toString(crDate,"dd.MM.yyyy") #'
      },
      { 
        command: "destroy", 
        title: " ", 
        width: "100px" 
      }];
      
  var keyGridSchema = {
        model: {
          fields: {
            type: { type: "string" },
            name: { type: "string" },
            email: { type: "string" },
            id: { type: "string" },
            crDate: { type: "date" }
          }
        }
      };
      
  function init() {
    options.viewModel('getKeys', initGrid);
  }


  function initGrid(keys) {
        
    var grid = $("#mainKeyGrid").kendoGrid({
      columns: keyGridColumns,
      dataSource: {
        data: options.mapDates(keys),
        schema: keyGridSchema 
      },
      detailTemplate: kendo.template($("#keyDetails").html()),
      detailInit: detailInit,
      sortable: {
        mode: "multiple", // enables multi-column sorting
        allowUnsort: true
      },
      toolbar: kendo.template($("#keyToolbar").html()),
      editable: {
        update: false,
        destroy: true,
        confirmation: "Are you sure you want to remove this key?",
      },
      remove: onRemoveKey
    });
    
    function onRemoveKey(e) {
      options.viewModel('removeKey', [e.model.guid, e.model.type]);
    }
        
    grid.find("#keyType").kendoDropDownList({
      dataTextField: "text",
      dataValueField: "value",
      autoBind: false,
      optionLabel: "All",
      dataSource: [
        { text: "Public Keys", value: "public" },
        { text: "Private Keys", value: "private" }
      ],
      change: onDropDownChange
    });  
      
    function onDropDownChange() {
      var value = this.value();
      if (value) {
        grid.data("kendoGrid").dataSource.filter({ field: "type", operator: "eq", value: value });
      } else {
        grid.data("kendoGrid").dataSource.filter({});
      }
    }
   
  }
      
  function detailInit(e) {
    var detailRow = e.detailRow;
    
    detailRow.find(".tabstrip").kendoTabStrip({
      animation: {
        open: { effects: "fadeIn" }
      }
    });
    
    detailRow.find(".subkeyID").kendoDropDownList({
      dataTextField: "id",
      dataValueField: "id",
      dataSource: e.data.subkeys,
      select: onSubkeySelect,
      index: 0
    });
    
    var template = kendo.template($("#subkeyDetails").html());
    var subkeyDetails = detailRow.find(".subkeyDetails");
    if (e.data.subkeys.length !== 0) {
      subkeyDetails.html(template(e.data.subkeys[0]));
    } else {
      subkeyDetails.html('<li>No subkeys available</li>');
    }
    
    function onSubkeySelect(e) {
      var dataItem = this.dataItem(e.item.index());
      subkeyDetails.html(template(dataItem));
    }
    
    var useridDdl = detailRow.find(".userID");  
    
    useridDdl.width(300);
    useridDdl.kendoDropDownList({
      dataTextField: "userID",
      dataValueField: "userID",
      dataSource: e.data.users,
      select: onUserSelect,
      index: 0
    });
    
    detailRow.find(".signerGrid").kendoGrid({
      columns:[
      {
        field: "signer",
        title: "Signer Name"
      },
      {
        field: "id",
        width: 150,
        title: "Signer KeyID"
      },  
      {
        field: "crDate",
        width: 90,
        title: "Created",
        template: '#= kendo.toString(crDate,"dd.MM.yyyy") #'
      }],
      dataSource: {
        data: e.data.users[0].signatures,
        schema: {
          model: {
            fields: {
              signer: { type: "string" },
              id: { type: "string" },
              crDate: { type: "date" }
            }
          }
        }
      },
      sortable: true,
    });
    
    var signerGrid = detailRow.find(".signerGrid").data("kendoGrid");
    
    function onUserSelect(e) {
      var dataItem = this.dataItem(e.item.index());
      signerGrid.dataSource.data(dataItem.signatures);
    }
    
  }
      
  $(document).ready(init);
    
}()); 
