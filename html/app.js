/*global angular*/
(function () {
  "use strict";

  var app = angular.module('dossierApp', ['ng-admin']);

  // Define custom filter to calculate totals.
  app.filter('sumByKey', function () {
      return function (data, key) {

          if (!data || typeof (data) === 'undefined' || typeof (key) === 'undefined') {
              return 0;
          }
          var sum = 0;
          for (var i = data.length - 1; i >= 0; i--) {
              sum += parseInt(data[i][key]);
          }
          return sum;
      };
  });

  app.controller('main', function ($scope, $rootScope, $location) {

    $rootScope.$on('$stateChangeSuccess', function () {
      $scope.displayBanner = $location.$$path === '/dashboard';
    });
  });

  app.config(function (NgAdminConfigurationProvider, RestangularProvider) {
    var nga = NgAdminConfigurationProvider;

    function truncate(value) {
      if (!value) {
        return '';
      }

      return value.length > 50 ? value.substr(0, 50) + '...' : value;
    }

    function utcfy(value) {
      if (!value) {
        console.log('empty date');
        return '';
      }
      console.log(value);
      return value.length > 10 ? value : value+'T00:00:00Z';
    }

    // use the custom query parameters function to format the API request correctly
    RestangularProvider.addFullRequestInterceptor(function(element, operation, what, url, headers, params) {
      if (operation == "getList") {
        // custom pagination params
        if (params._page) {
          params._start = (params._page - 1) * params._perPage;
          params._end = params._page * params._perPage;
        }
        delete params._page;
        delete params._perPage;
        // custom sort params
        if (params._sortField) {
          params._sort = params._sortField;
          delete params._sortField;
        }
        // custom filters
        if (params._filters) {
          for (var filter in params._filters) {
            params[filter] = params._filters[filter];
          }
          delete params._filters;
        }
      }
      return { params: params };
    });

    var partecipazioniView =
            '<table class="table">' +
            '<thead><tr>' +
              '<th>Persona</th>' +
              '<th>Denominazione</th>' +
              '<th>Città sede</th>' +
              '<th>Provincia sede</th>' +
              '<th>Quote</th>' +
              '<th>Annotazioni</th>' +
            '</tr></thead>' +
            '<tbody>' +
              '<tr ng-repeat="obj in entry.values.partecipazioni_soc">' +
                '<td>{{obj.persona}}</td>' +
                '<td>{{obj.denominazione}}</td>' +
                '<td>{{obj.citta_sede}}</td>' +
                '<td>{{obj.provincia_sede}}</td>' +
                '<td>{{obj.numero_azioni_quote}}</td>' +
                '<td>{{obj.annotazioni}}</td>' +
              '</tr>' +
            '</tbody>' +
            '</table>';

    var partecipazioniEdit =
            '<table class="table">' +
            '<thead><tr>' +
              '<th>Persona</th>' +
              '<th>Denominazione</th>' +
              '<th>Città sede</th>' +
              '<th>Provincia sede</th>' +
              '<th>Quote</th>' +
              '<th>Valore economico</th>' +
              '<th>Annotazioni</th>' +
            '</tr></thead>' +
            '<tbody>' +
              '<tr ng-repeat="obj in entry.values.partecipazioni_soc">' +
                '<td><select name="select_persona" ng-model="obj.persona" required><option value="coniuge">Coniuge</option><option value="dichiarante">Dichiarante</option></select></td>' +
                '<td><input ng-model="obj.denominazione" size=12 placeholder="Denominazione" type="text" value="{{obj.denominazione}}" required/></td>' +
                '<td><input ng-model="obj.citta_sede" size=8 placeholder="Città sede" type="text" value="{{obj.citta_sede}}" required/></td>' +
                '<td><input ng-model="obj.provincia_sede" size=2 placeholder="Provincia sede" type="text" value="{{obj.provincia_sede}}" required/></td>' +
                '<td><input ng-model="obj.numero_azioni_quote" size=4 placeholder="Quote" type="text" value="{{obj.numero_azioni_quote}}" required/></td>' +
                '<td><input ng-model="obj.valore_economico" size=4 placeholder="Valore" type="number" step="any" value="{{obj.valore_economico}}" required/></td>' +
                '<td><input ng-model="obj.annotazioni" size=12 placeholder="Annotazioni" type="text" value="{{obj.annotazioni}}"/></td>' +
                '<td><button type="button" class="btn btn-default btn-xs" ng-click="entry.values.partecipazioni_soc.splice($index, 1)"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span>Rimuovi</button></td>' +
              '</tr>' +
            '</tbody>' +
            '</table>'+
            '<button type="button" class="btn btn-default btn-sm" ng-click="entry.values.partecipazioni_soc.push({})"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span>Aggiungi</button>';

    var partecipazioniInsert =
            '<table class="table">' +
            '<thead><tr>' +
              '<th>Persona</th>' +
              '<th>Denominazione</th>' +
              '<th>Città sede</th>' +
              '<th>Provincia sede</th>' +
              '<th>Quote</th>' +
              '<th>Valore economico</th>' +
              '<th>Annotazioni</th>' +
            '</tr></thead>' +
            '<tbody>' +
              '<tr ng-repeat="obj in entry.values.partecipazioni_soc">' +
                '<td><select name="select_persona" ng-model="obj.persona" required><option value="coniuge">Coniuge</option><option value="dichiarante">Dichiarante</option></select></td>' +
                '<td><input ng-model="obj.denominazione" size=12 placeholder="Denominazione" type="text" value="{{obj.denominazione}}" required/></td>' +
                '<td><input ng-model="obj.citta_sede" size=8 placeholder="Città sede" type="text" value="{{obj.citta_sede}}" required/></td>' +
                '<td><input ng-model="obj.provincia_sede" size=2 placeholder="Provincia sede" type="text" value="{{obj.provincia_sede}}" required/></td>' +
                '<td><input ng-model="obj.numero_azioni_quote" size=4 placeholder="Quote" type="text" value="{{obj.numero_azioni_quote}}" required/></td>' +
                '<td><input ng-model="obj.valore_economico" size=4 placeholder="Valore" type="number" step="any" value="{{obj.valore_economico}}" required/></td>' +
                '<td><input ng-model="obj.annotazioni" size=12 placeholder="Annotazioni" type="text" value="{{obj.annotazioni}}"/></td>' +
                '<td><button type="button" class="btn btn-default btn-xs" ng-click="entry.values.partecipazioni_soc.splice($index, 1)"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span>Rimuovi</button></td>' +
              '</tr>' +
            '</tbody>' +
            '</table>'+
            '<button ng-show="showAddPart" type="button" class="btn btn-default btn-sm" ng-click="entry.values.partecipazioni_soc.push({})"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span>Aggiungi</button>' +
            '<button ng-hide="showAddPart" type="button" class="btn btn-default btn-sm" ng-click="entry.values.partecipazioni_soc=[{}];showAddPart=1"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span>Aggiungi</button><br>';

    var amministrazioneView =
            '<table class="table">' +
            '<thead><tr>' +
              '<th>Persona</th>' +
              '<th>Denominazione</th>' +
              '<th>Città sede</th>' +
              '<th>Provincia sede</th>' +
              '<th>Incarico</th>' +
              '<th>Annotazioni</th>' +
            '</tr></thead>' +
            '<tbody>' +
              '<tr ng-repeat="obj in entry.values.amministrazioni_soc">' +
                '<td>{{obj.persona}}</td>' +
                '<td>{{obj.denominazione}}</td>' +
                '<td>{{obj.citta_sede}}</td>' +
                '<td>{{obj.provincia_sede}}</td>' +
                '<td>{{obj.natura_incarico}}</td>' +
                '<td>{{obj.annotazioni}}</td>' +
              '</tr>' +
            '</tbody>' +
            '</table>';

    var amministrazioneEdit =
            '<table class="table">' +
            '<thead><tr>' +
              '<th>Persona</th>' +
              '<th>Denominazione</th>' +
              '<th>Città sede</th>' +
              '<th>Provincia sede</th>' +
              '<th>Incarico</th>' +
              '<th>Annotazioni</th>' +
            '</tr></thead>' +
            '<tbody>' +
              '<tr ng-repeat="obj in entry.values.amministrazioni_soc">' +
                '<td><select name="select_persona" ng-model="obj.persona" required><option value="coniuge">Coniuge</option><option value="dichiarante">Dichiarante</option></select></td>' +
                '<td><input ng-model="obj.denominazione" size=12 placeholder="Denominazione" type="text" value="{{obj.denominazione}}" required/></td>' +
                '<td><input ng-model="obj.citta_sede" size=8 placeholder="Città sede" type="text" value="{{obj.citta_sede}}" required/></td>' +
                '<td><input ng-model="obj.provincia_sede" size=2 placeholder="Provincia sede" type="text" value="{{obj.provincia_sede}}" required/></td>' +
                '<td><input ng-model="obj.natura_incarico" size=10 placeholder="Incarico" type="text" value="{{obj.natura_incarico}}" required/></td>' +
                '<td><input ng-model="obj.annotazioni" size=12 placeholder="Annotazioni" type="text" value="{{obj.annotazioni}}"/></td>' +
                '<td><button type="button" class="btn btn-default btn-xs" ng-click="entry.values.partecipazioni_soc.splice($index, 1)"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span>Rimuovi</button></td>' +
              '</tr>' +
            '</tbody>' +
            '</table>'+
            '<button type="button" class="btn btn-default btn-sm" ng-click="entry.values.amministrazioni_soc.push({})"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span>Aggiungi</button>';

    var amministrazioneInsert =
            '<table class="table">' +
            '<thead><tr>' +
              '<th>Persona</th>' +
              '<th>Denominazione</th>' +
              '<th>Città sede</th>' +
              '<th>Provincia sede</th>' +
              '<th>Incarico</th>' +
              '<th>Annotazioni</th>' +
            '</tr></thead>' +
            '<tbody>' +
              '<tr ng-repeat="obj in entry.values.amministrazioni_soc">' +
                '<td><select name="select_persona" ng-model="obj.persona" required><option value="coniuge">Coniuge</option><option value="dichiarante">Dichiarante</option></select></td>' +
                '<td><input ng-model="obj.denominazione" size=12 placeholder="Denominazione" type="text" value="{{obj.denominazione}}" required/></td>' +
                '<td><input ng-model="obj.citta_sede" size=8 placeholder="Città sede" type="text" value="{{obj.citta_sede}}" required/></td>' +
                '<td><input ng-model="obj.provincia_sede" size=2 placeholder="Provincia sede" type="text" value="{{obj.provincia_sede}}" required/></td>' +
                '<td><input ng-model="obj.natura_incarico" size=10 placeholder="Incarico" type="text" value="{{obj.natura_incarico}}" required/></td>' +
                '<td><input ng-model="obj.annotazioni" size=12 placeholder="Annotazioni" type="text" value="{{obj.annotazioni}}"/></td>' +
                '<td><button type="button" class="btn btn-default btn-xs" ng-click="entry.values.amministrazioni_soc.splice($index, 1)"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span>Rimuovi</button></td>' +
              '</tr>' +
            '</tbody>' +
            '</table>'+
						'<button ng-show="showAddAmm" type="button" class="btn btn-default btn-sm" ng-click="entry.values.amministrazioni_soc.push({})"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span>Aggiungi voce</button>' +
						'<button ng-hide="showAddAmm" type="button" class="btn btn-default btn-sm" ng-click="entry.values.amministrazioni_soc=[{}];showAddAmm=1"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span>Aggiungi voce</button><br>';

    var templateBeniImmobiliView =
            '<table class="table">' +
            '<thead><tr>' +
              '<th>Persona</th>' +
              '<th>Natura diritto</th>' +
              '<th>Descrizione</th>' +
              '<th>Provincia</th>' +
              '<th>Comune</th>' +
              '<th>Annotazioni</th>' +
            '</tr></thead>' +
            '<tbody>' +
              '<tr ng-repeat="obj in entry.values.beni_immobili">' +
                '<td>{{obj.persona}}</td>' +
                '<td>{{obj.natura_diritto}}</td>' +
                '<td>{{obj.descrizione}}</td>' +
                '<td>{{obj.provincia}}</td>' +
                '<td>{{obj.comune}}</td>' +
                '<td>{{obj.annotazioni}}</td>' +
              '</tr>' +
            '</tbody>' +
            '</table>';

    var templateBeniImmobiliEdit =
        '<table class="table">' +
        '<thead><tr>' +
          '<th>Persona</th>' +
          '<th>Natura diritto</th>' +
          '<th>Descrizione</th>' +
          '<th>Provincia</th>' +
          '<th>Comune</th>' +
          '<th>Rendita</th>' +
          '<th>Categoria catastale</th>' +
          '<th>Annotazioni</th>' +
        '</tr></thead>' +
        '<tbody>' +
          '<tr ng-repeat="obj in entry.values.beni_immobili">' +
            '<td><select name="select_persona" ng-model="obj.persona" required><option value="coniuge">Coniuge</option><option value="dichiarante">Dichiarante</option></select></td>' +
            '<td><input ng-model="obj.natura_diritto" size=8 placeholder="Tipologia" type="text" value="{{obj.natura_diritto}}" /></td>' +
            '<td><input ng-model="obj.descrizione" size=12 placeholder="Descrione" type="text" value="{{obj.descrizione}}" required/></td>' +
            '<td><input ng-model="obj.provincia" ng-minlength="2" ng-maxlength="2" size=2 placeholder="XX" value="{{obj.provincia}}" required/></td>' +
            '<td><input ng-model="obj.comune" size=8 placeholder="Comune"/ value="{{obj.comune}}" required/></td>' +
            '<td><input ng-model="obj.rendita_catastale" size=8 type="number" value="{{obj.rendita_catastale}}"/></td>' +
            '<td><input ng-model="obj.categoria_catastale" size=8 placeholder="Categoria" type="text" value="{{obj.categoria_catastale}}"/></td>' +
            '<td><input ng-model="obj.annotazioni" size=14 placeholder="Note" type="text" value="{{obj.annotazioni}}"/></td>' +
            '<td><button type="button" class="btn btn-default btn-xs" ng-click="entry.values.beni_immobili.splice($index, 1)"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span>Rimuovi</button></td>' +
          '</tr>' +
        '</tbody>' +
        '</table>' +
        '<button type="button" class="btn btn-default btn-sm" ng-click="entry.values.beni_immobili.push({})"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span>Aggiungi bene</button>';

    var templateBeniImmobiliInsert =
        '<table class="table">' +
        '<thead><tr>' +
          '<th>Persona</th>' +
          '<th>Natura diritto</th>' +
          '<th>Descrizione</th>' +
          '<th>Provincia</th>' +
          '<th>Comune</th>' +
          '<th>Annotazioni</th>' +
        '</tr></thead>' +
        '<tbody>' +
          '<tr ng-repeat="obj in entry.values.beni_immobili">' +
            '<td><select name="select_persona" ng-model="obj.persona" required><option value="coniuge">Coniuge</option><option value="dichiarante">Dichiarante</option></select></td>' +
            '<td><input ng-model="obj.natura_diritto" size=8 placeholder="tipologia" type="text" value="{{obj.natura_diritto}}" required/></td>' +
            '<td><input ng-model="obj.descrizione" size=12 placeholder="Descrione"/ type="text" value="{{obj.descrizione}}" required/></td>' +
            '<td><input ng-model="obj.provincia" ng-minlength="2" ng-maxlength="2" size=2 placeholder="XX"/ value="{{obj.provincia}}"/></td>' +
            '<td><input ng-model="obj.comune" size=8 placeholder="Comune"/ value="{{obj.comune}}" required/></td>' +
            '<td><input ng-model="obj.annotazioni" size=14 placeholder="Note"/ type="text" value="{{obj.annotazioni}}" required/></td>' +
            '<td><button type="button" class="btn btn-default btn-xs" ng-click="entry.values.beni_immobili.splice($index, 1)"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span>Rimuovi</button></td>' +
          '</tr>' +
        '</tbody>' +
        '</table>' +
        '<button ng-show="showAddImm" type="button" class="btn btn-default btn-sm" ng-click="entry.values.beni_immobili.push({})"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span>Aggiungi bene</button>' +
        '<button ng-hide="showAddImm" type="button" class="btn btn-default btn-sm" ng-click="entry.values.beni_immobili=[{}];showAddImm=1"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span>Aggiungi bene</button><br>';

    var templateSpeseView =
            '<table class="table">' +
            '<thead><tr>' +
              '<th>Fonte</th>' +
              '<th>Elezione</th>' +
              '<th>Anno</th>' +
              '<th>Importo</th>' +
            '</tr></thead>' +
            '<tbody>' +
              '<tr ng-repeat="obj in entry.values.spese_elettorali">' +
                '<td>{{obj.fonte}}</td>' +
                '<td>{{obj.tipo_elezione}}</td>' +
                '<td>{{obj.anno}}</td>' +
                '<td style="text-align:right">{{obj.importo|currency:"&euro;"}}</td>' +
              '</tr>' +
              '<tr>' +
                '<td>Quota forfettaria spese</td>' +
                '<td></td>' +
                '<td></td>' +
                '<td style="text-align:right">{{entry.values.quota_forfettaria_spese|currency:"&euro;"}}</td>' +
              '</tr>' +
              '<tr>' +
                '<td>Totale</td>' +
                '<td></td>' +
                '<td></td>' +
                '<td style="text-align:right">{{entry.values.totale_spese_elettorali|currency:"&euro;"}}</td>' +
              '</tr>' +
            '</tbody>' +
            '</table>';

    var templateSpeseEdit =
            '<table class="table">' +
            '<thead><tr>' +
              '<th>Fonte</th>' +
              '<th>Elezione</th>' +
              '<th>Anno</th>' +
              '<th>Importo</th>' +
            '</tr></thead>' +
            '<tbody>' +
              '<tr ng-repeat="obj in entry.values.spese_elettorali">' +
								'<td><input ng-model="obj.fonte" size=16 placeholder="Fonte" type="text" value="{{obj.fonte}}" /></td>' +
								'<td>'+
									'<select name="select_elezione" ng-model="obj.tipo_elezione" ><option value="camera">Camera</option><option value="senato">Senato</option></select>'+
									'<span class="error" ng-show="formController.form.select_elezione.$error.required">required</span>'+ // FIXME
									'</td>' +
								'<td><input ng-model="obj.anno" size=4 placeholder="Anno" type="number" value="{{obj.anno}}" /></td>' +
								'<td><input ng-model="obj.importo" size=4 placeholder="Importo" type="number" step="any" value="{{obj.importo}}" /></td>' +
								'<td><button type="button" class="btn btn-default btn-xs" ng-click="entry.values.spese_elettorali.splice($index, 1)"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span>Rimuovi</button></td>' +
              '</tr>' +
              '<tr>' +
                '<td>Totale calcolato</td>' +
                '<td></td>' +
                '<td></td>' +
                '<td><span>{{entry.values.spese_elettorali|sumByKey:"importo"|currency:"&euro;"}}</span></td>' +
              '</tr>' +
            '</tbody>' +
            '</table>' +
						'<button type="button" class="btn btn-default btn-sm" ng-click="entry.values.spese_elettorali.push({})"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span>Aggiungi</button>';

    var templateSpeseInsert =
            '<table class="table">' +
            '<thead><tr>' +
              '<th>Fonte</th>' +
              '<th>Elezione</th>' +
              '<th>Anno</th>' +
              '<th>Importo</th>' +
            '</tr></thead>' +
            '<tbody>' +
              '<tr ng-repeat="obj in entry.values.spese_elettorali">' +
								'<td>'+
									'<select ng-model="obj.fonte" type="text" required>'+
									'<option value="produzione materiale e mezzi di propaganda">produzione materiale e mezzi di propaganda</option>'+
									'<option value="distribuzione e diffusione del materiale">distribuzione e diffusione del materiale</option>'+
									'<option value="organizzazione di manifestazioni">organizzazione di manifestazioni</option>'+
									'<option value="acquisto spazi su organi di informazione">acquisto spazi su organi di informazione</option>'+
									'<option value="spese per personali e prestazioni">spese per personali e prestazioni</option>'+
									'<option value="contributo al partito">contributo al partito</option>'+
									'<option value="varie">varie</option>'+
									'<option value="spese sostenute dal partito">spese sostenute dal partito</option>'+
								'</select>' +
								'</td>' +
								'<td>'+
									'<select name="select_elezione" ng-model="obj.tipo_elezione" ><option value="camera">Camera</option><option value="senato">Senato</option></select>'+
									'<span class="error" ng-show="formController.form.select_elezione.$error.required">required</span>'+ // FIXME
									'</td>' +
								'<td><input ng-model="obj.anno" size=4 placeholder="Anno" type="number" value="{{obj.anno}}" /></td>' +
								'<td><input ng-model="obj.importo" size=4 placeholder="Importo" type="number" step="any" value="{{obj.importo}}" /></td>' +
								'<td><button type="button" class="btn btn-default btn-xs" ng-click="entry.values.spese_elettorali.splice($index, 1)"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span>Rimuovi</button></td>' +
              '</tr>' +
              '<tr>' +
                '<td>Totale calcolato</td>' +
                '<td></td>' +
                '<td></td>' +
                '<td><span>{{entry.values.spese_elettorali|sumByKey:"importo"|currency:"&euro;"}}</span></td>' +
              '</tr>' +
            '</tbody>' +
            '</table>' +
						'<button ng-show="showAddSpes" type="button" class="btn btn-default btn-sm" ng-click="entry.values.spese_elettorali.push({})"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span>Aggiungi voce</button>' +
						'<button ng-hide="showAddSpes" type="button" class="btn btn-default btn-sm" ng-click="entry.values.spese_elettorali=[{}];showAddSpes=1"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span>Aggiungi voce</button><br>';

    var contributiView =
            '<table class="table">' +
            '<thead><tr>' +
              '<th>Fonte</th>' +
              '<th>Elezione</th>' +
              '<th>Anno</th>' +
              '<th>Importo</th>' +
            '</tr></thead>' +
            '<tbody>' +
              '<tr ng-repeat="obj in entry.values.contributi_elettorali">' +
                '<td>{{obj.fonte}}</td>' +
                '<td>{{obj.tipo_elezione}}</td>' +
                '<td>{{obj.anno}}</td>' +
                '<td style="text-align:right">{{obj.importo|currency:"&euro;"}}</td>' +
              '</tr>' +
              '<tr>' +
                '<td>Totale</td>' +
                '<td></td>' +
                '<td></td>' +
                '<td style="text-align:right">{{entry.values.totale_contributi_elettorali|currency:"&euro;"}}</td>' +
              '</tr>' +
            '</tbody>' +
            '</table>';

    var contributiEdit =
				//'<span>debug field name: {{field.name()}}</span>'+
				//'<span>debug field {{field}}</span><br>'+
				//'<span>debug form {{this}}</span>'+
            '<table class="table">' +
            '<thead><tr>' +
              '<th>Fonte</th>' +
              '<th>Elezione</th>' +
              '<th>Anno</th>' +
              '<th>Importo</th>' +
            '</tr></thead>' +
            '<tbody>' +
              '<tr ng-repeat="obj in entry.values.contributi_elettorali">' +
								'<td><input ng-model="obj.fonte" size=16 placeholder="Fonte" type="text" value="{{obj.fonte}}" /></td>' +
								'<td>'+
									'<select name="select_elezione" ng-model="obj.tipo_elezione"><option value="camera">Camera</option><option value="senato">Senato</option></select>'+
									'<span class="error" ng-show="formController.form.select_elezione.$error.required">required</span>'+ // FIXME
								'</td>' +
								'<td><input ng-model="obj.anno" size=4 placeholder="Anno" type="number" value="{{obj.anno}}"/></td>' +
								'<td><input ng-model="obj.importo" size=4 placeholder="Importo" type="number" step="any" value="{{obj.importo}}"/></td>' +
								'<td><button type="button" class="btn btn-default btn-xs" ng-click="entry.values.contributi_elettorali.splice($index, 1)"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span>Rimuovi</button></td>' +
              '</tr>' +
              '<tr>' +
                '<td>Totale calcolato</td>' +
                '<td></td>' +
                '<td></td>' +
                '<td><span>{{entry.values.contributi_elettorali|sumByKey:"importo"|currency:"&euro;"}}</span></td>' +
              '</tr>' +
            '</tbody>' +
            '</table>' +
						'<button type="button" class="btn btn-default btn-sm" ng-click="entry.values.contributi_elettorali.push({})"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span>Aggiungi</button>';

    var contributiInsert =
            '<table class="table">' +
            '<thead><tr>' +
              '<th>Fonte</th>' +
              '<th>Elezione</th>' +
              '<th>Anno</th>' +
              '<th>Importo</th>' +
            '</tr></thead>' +
            '<tbody>' +
              '<tr ng-repeat="obj in entry.values.contributi_elettorali">' +
								'<td>'+
									'<select ng-model="obj.fonte" type="text" required>'+
									'<option value="contributo ex legge n. 195/74">contributo ex legge n. 195/74</option>'+
									'<option value="erogazioni del candidato">erogazioni del candidato</option>'+
									'<option value="contributi o servizi ricevuti dal partito">contributi o servizi ricevuti dal partito</option>'+
									'<option value="contributi da terzi">contributi da terzi</option>'+
									'<option value="servizi da terzi">servizi da terzi</option>'+
									'<option value="debiti">debiti</option>'+
								'</select>' +
								'</td>'+
								'<td>'+
									'<select name="select_elezione" ng-model="obj.tipo_elezione">'+
										'<option value="camera">Camera</option>'+
										'<option value="senato">Senato</option>'+
									'</select>'+
									'<span class="error" ng-show="formController.form.select_elezione.$error.required">required</span>'+ // FIXME
								'</td>' +
								'<td><input ng-model="obj.anno" size=4 placeholder="Anno" type="number" value="{{obj.anno}}"/></td>' +
								'<td><input ng-model="obj.importo" size=4 placeholder="Importo" type="number" step="any" value="{{obj.importo}}"/></td>' +
								'<td><button type="button" class="btn btn-default btn-xs" ng-click="entry.values.contributi_elettorali.splice($index, 1)"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span>Rimuovi</button></td>' +
              '</tr>' +
              '<tr>' +
                '<td>Totale calcolato</td>' +
                '<td></td>' +
                '<td></td>' +
                '<td><span>{{entry.values.contributi_elettorali|sumByKey:"importo"|currency:"&euro;"}}</span></td>' +
              '</tr>' +
            '</tbody>' +
            '</table>' +
						'<button ng-show="showAddCon" type="button" class="btn btn-default btn-sm" ng-click="entry.values.contributi_elettorali.push({})"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span>Aggiungi bene</button>' +
						'<button ng-hide="showAddCon" type="button" class="btn btn-default btn-sm" ng-click="entry.values.contributi_elettorali=[{}];showAddCon=1"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span>Aggiungi bene</button><br>';


    var templateBeniMobiliView =
            '<table class="table">' +
            '<thead><tr>' +
              '<th>Persona</th>' +
              '<th>Tipologia</th>' +
              '<th>Cavalli fiscali</th>' +
              '<th>Anno immatricolazione</th>' +
              '<th>Annotazioni</th>' +
            '</tr></thead>' +
            '<tbody>' +
              '<tr ng-repeat="obj in entry.values.beni_mobili">' +
                '<td>{{obj.persona}}</td>' +
                '<td>{{obj.tipologia}}</td>' +
                '<td>{{obj.cavalli_fiscali}}</td>' +
                '<td>{{obj.anno_immatricolazione}}</td>' +
                '<td>{{obj.annotazioni}}</td>' +
              '</tr>' +
            '</tbody>' +
            '</table>';

    var templateBeniMobiliEdit =
      //'data debug: {{entry.values}}<br>'+
        '<table class="table" style="text-align:center">' +
        '<thead><tr>' +
          '<th>Persona</th>' +
          '<th>Tipologia</th>' +
          '<th>Cavalli fiscali</th>' +
          '<th>Anno immatricolazione</th>' +
          '<th>Annotazioni</th>' +
          '<th>Azioni</th>' +
        '</tr></thead>' +
        '<tbody>' +
          '<tr ng-repeat="obj in entry.values.beni_mobili">' +
            '<td><select name="select_persona" ng-model="obj.persona" required><option value="coniuge">Coniuge</option><option value="dichiarante">Dichiarante</option></select></td>' +
            '<td><input ng-model="obj.tipologia" size=8 placeholder="tipologia" type="text" value="{{obj.tipologia}}" required/></td>' +
            '<td><input ng-model="obj.cavalli_fiscali" size=5 placeholder="CV" type="text" value="{{obj.cavalli_fiscali}}" required/></td>' +
            '<td><input ng-model="obj.anno_immatricolazione" ng-minlength="4" ng-maxlength="4" size=4 placeholder="Anno"/ type="number" value="{{obj.anno_immatricolazione}}" required/></td>' +
            '<td><input ng-model="obj.annotazioni" size=14 placeholder="Note"/ type="text" value="{{obj.annotazioni}}" required/></td>' +
            '<td><button type="button" class="btn btn-default btn-xs" ng-click="entry.values.beni_mobili.splice($index, 1)"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span>Rimuovi</button></td>' +
          '</tr>' +
        '</tbody>' +
        '</table>' +
        '<button type="button" class="btn btn-default btn-sm" ng-click="entry.values.beni_mobili.push({})"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span>Aggiungi bene</button>';

    var templateBeniMobiliInsert =
        '<table class="table" style="text-align:right">' +
        '<thead><tr>' +
          '<th>Persona</th>' +
          '<th>Tipologia</th>' +
          '<th>Cavalli fiscali</th>' +
          '<th>Anno immatricolazione</th>' +
          '<th>Annotazioni</th>' +
          '<th>Azioni</th>' +
        '</tr></thead>' +
        '<tbody>' +
          '<tr ng-repeat="obj in entry.values.beni_mobili">' +
            '<td><select name="select_persona" ng-model="obj.Persona" required><option value="coniuge">Coniuge</option><option value="dichiarante">Dichiarante</option></select></td>' +
            '<td><input ng-model="obj.tipologia" size=8 placeholder="tipologia" type="text" value="{{obj.tipologia}}" required/></td>' +
            '<td><input ng-model="obj.cavalli_fiscali" size=5 placeholder="CV" type="text" value="{{obj.cavalli_fiscali}}" required/></td>' +
            '<td><input ng-model="obj.anno_immatricolazione" ng-minlength="4" ng-maxlength="4" size=4 placeholder="Anno" type="number" value="{{obj.anno_immatricolazione}}" required/></td>' +
            '<td><input ng-model="obj.annotazioni" size=14 placeholder="Note" type="text" value="{{obj.annotazioni}}" required/></td>' +
            '<td><button type="button" class="btn btn-default btn-xs" ng-click="entry.values.beni_mobili.splice($index, 1)"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span>Rimuovi</button></td>' +
          '</tr>' +
        '</tbody>' +
        '</table>' +
        '<button ng-show="showAddMob" type="button" class="btn btn-default btn-sm" ng-click="entry.values.beni_mobili.push({})"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span>Aggiungi bene</button>' +
        '<button ng-hide="showAddMob" type="button" class="btn btn-default btn-sm" ng-click="entry.values.beni_mobili=[{}];showAddMob=1"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span>Aggiungi bene</button><br>';

    var template730View =
            '<table class="table" style="text-align:right">' +
            '<thead><tr>' +
              '<th>Voce</th>' +
              '<th>Dichiarante</th>' +
              '<th>Coniuge</th>' +
              '<th>Totale</th>' +
            '</tr></thead>' +
            '<tbody>' +
              '<tr ng-repeat="obj in entry.values.reddito_730">' +
                '<td>{{obj.voce_730}}</td>' +
                '<td>{{obj.dichiarante|currency:"&euro;"}}</td>' +
                '<td>{{obj.coniuge|currency:"&euro;"}}</td>' +
                '<td>{{obj.totale|currency:"&euro;"}}</td>' +
              '</tr>' +
              '<tr>' +
                '<td>Totale</td>' +
                '<td>{{entry.values.totale_730_dichiarante|currency:"&euro;"}}</td>' +
                '<td>{{entry.values.totale_730_coniuge|currency:"&euro;"}}</td>' +
                '<td>{{entry.values.totale_730|currency:"&euro;"}}</td>' +
              '</tr>' +
            '</tbody>' +
            '</table>';

    var template730Edit =
            //'{{entry.values.reddito_730}}' +
            '<table class="table">' +
            '<thead><tr>' +
              '<th>Voce</th>' +
              '<th>Dichiarante</th>' +
              '<th>Coniuge</th>' +
              '<th>Totale</th>' +
            '</tr></thead>' +
            '<tbody>' +
              '<tr ng-repeat="obj in entry.values.reddito_730">' +
                '<td><input ng-model="obj.voce_730" size=25 type="text" value="{{obj.voce_730}}" readonly/></td>' +
                '<td><input ng-model="obj.dichiarante" size=5 type="number" step="any" value="{{obj.dichiarante}}" /></td>' +
                '<td><input ng-model="obj.coniuge" size=5 type="number" step="any" value="{{obj.coniuge}}" /></td>' +
                '<td>	Calcolato: <span id="my-bind">{{obj.coniuge + obj.dichiarante|currency:"&euro;"}}</span><br>'+
									'<input ng-model="obj.totale" size=5 type="number" step="any" value="{{obj.totale}}" />'+
								'</td>' +
              '</tr>' +
              '<tr>' +
                '<td>Totali calcolati</td>' +
                '<td><span>{{entry.values.reddito_730|sumByKey:"dichiarante"|currency:"&euro;"}}</span></td>' +
                '<td><span>{{entry.values.reddito_730|sumByKey:"coniuge"|currency:"&euro;"}}</span></td>' +
                '<td><span>{{entry.values.reddito_730|sumByKey:"totale"|currency:"&euro;"}}</span></td>' +
              '</tr>' +
            '</tbody>' +
            '</table>';

    var template730Insert =
            //'{{entry.values}}' +
            '<table class="table">' +
            '<thead><tr>' +
              '<th>Voce</th>' +
              '<th>Dichiarante</th>' +
              '<th>Coniuge</th>' +
              '<th>Totale</th>' +
            '</tr></thead>' +
            '<tbody>' +
              '<tr ng-repeat="obj in entry.values.reddito_730">' +
								'<td>'+
									'<select ng-model="obj.voce_730" type="text">'+
										'<option value="1 - redditi dominicali">1 - redditi dominicali</option>'+
										'<option value="2 - redditi agrari">2 - redditi agrari</option>'+
										'<option value="3 - redditi dei fabbricati">3 - redditi dei fabbricati</option>'+
										'<option value="4 - redditi di lavoro dipendente e assimilati">4 - redditi di lavoro dipendente e assimilati</option>'+
										'<option value="5 - altri redditi	">5 - altri redditi</option>'+
									'</select>' +
								'</td>'+
                '<td><input ng-model="obj.dichiarante" size=5 type="number" step="any" value="{{obj.dichiarante}}" /></td>' +
                '<td><input ng-model="obj.coniuge" size=5 type="number" step="any" value="{{obj.coniuge}}" /></td>' +
                '<td>	Calcolato: <span id="my-bind">{{obj.coniuge + obj.dichiarante|currency:"&euro;"}}</span><br>'+
									'<input ng-model="obj.totale" size=5 type="number" step="any" value="{{obj.totale}}" />'+
								'</td>' +
              '</tr>' +
              '<tr>' +
                '<td>Totali calcolati</td>' +
                '<td><span>{{entry.values.reddito_730|sumByKey:"dichiarante"|currency:"&euro;"}}</span></td>' +
                '<td><span>{{entry.values.reddito_730|sumByKey:"coniuge"|currency:"&euro;"}}</span></td>' +
                '<td><span>{{entry.values.reddito_730|sumByKey:"totale"|currency:"&euro;"}}</span></td>' +
              '</tr>' +
            '</tbody>' +
            '</table>'+
						'<button ng-show="showAddRedd" type="button" class="btn btn-default btn-sm" ng-click="entry.values.reddito_730.push({})"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span>Aggiungi voce</button>' +
						'<button ng-hide="showAddRedd" type="button" class="btn btn-default btn-sm" ng-click="entry.values.reddito_730=[{}];showAddRedd=1"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span>Aggiungi voci</button><br>';

		var templateDownloadOrig = '<a href="{{entry.values.filename_url}}">Scarica {{entry.values.filename}}</a>';
		// FIXME
		// ng-show="{{entry.values.filename_rectification_url}}" gives error on console.
		var templateDownloadRect = '<a ng-show=entry.values.filename_rectification href="{{entry.values.filename_rectification_url}}">Scarica {{entry.values.filename_rectification}}</a>';

    var admin = nga.application('Openpolis dossier redditi - backend') // application main title
      .baseApiUrl('http://patrimoni.openpolis.it/api/p/'); // main API endpoint

    // define all entities at the top to allow references between them
    var parlamentari = nga.entity('parlamentari'); // the API endpoint for posts will be http://localhost:3000/posts/:id

    // set the application entities
    admin
      .addEntity(parlamentari);

    // customize entities and views

    parlamentari.dashboardView() // customize the dashboard panel for this entity
      .title('Dichiarazioni parlamentari recenti')
      .order(1) // display the post panel first in the dashboard
      .perPage(5) // limit the panel to the 5 latest posts
      .fields([nga.field('cognome').isDetailLink(true).map(truncate), nga.field('nome'), nga.field('anno_dichiarazione')]); // fields() called with arguments add fields to the view

    parlamentari.listView()
      .title('Tutte le dichiarazioni dei parlamentari') // default title is "[Entity_name] list"
      .description('List of parlamentari...') // description appears under the title
      .perPage(15) // limit the number of elements displayed per page. Default is 30.
      .fields([
        nga.field('nome').isDetailLink(true), // the default list field type is "string", and displays as a string
        nga.field('cognome'), // the default list field type is "string", and displays as a string
        //nga.field('id').label('ID'), // The default displayed name is the camelCase field name. label() overrides id
        nga.field('op_id').label('ID openpolitici'), // The default displayed name is the camelCase field name. label() overrides id
        nga.field('data_nascita', 'date')
          .format('dd-MM-yyyy'),
        nga.field('anno_dichiarazione', 'number')
      ])
      .filters([
        nga.field('q', 'string').label('').attributes({'placeholder': 'Ricerca testo globale'})
      ])
      .listActions(['show', 'edit', 'delete']);

    parlamentari.creationView()
      .title('Inserimento dichiarazione "{{ entry.values.nome }} {{ entry.values.cognome }} {{ entry.values.anno_dichiarazione}}"') // title() accepts a template string, which has access to the entry
      .fields([
        nga.field('anno_dichiarazione', 'number')
          .validation({ required: true, minlength: 4, maxlength: 4 }),
        nga.field('op_id')
          .validation({ required: true, minlength: 2 }),
        nga.field('nome') // the default edit field type is "string", and displays as a text input
          .attributes({ placeholder: 'Nome' }) // you can add custom attributes, too
          .validation({ required: true, minlength: 3, maxlength: 100 }), // add validation rules for fields
        nga.field('cognome') // the default edit field type is "string", and displays as a text input
          .attributes({ placeholder: 'Cognome' }) // you can add custom attributes, too
          .validation({ required: true, minlength: 3, maxlength: 100 }), // add validation rules for fields
        nga.field('data_nascita', 'date')
          //.format('dd-MM-yyyy') // 2006-01-02T15:04:05Z07:00 Date field type allows date formatting
          //.transform(utcfy) // FIXME update ng-admin version
          .map(utcfy)
          .label("Data di nascita"),
        nga.field('stato_civile', 'choice')
          .choices([
            { value: 'celibe', label: 'Celibe' },
            { value: 'nubile', label: 'Nubile' },
            { value: 'coniugato', label: 'Coniugato' },
          ])
          .validation({ required: true }),
        nga.field('comune_nascita')
          .validation({ required: true }),
        nga.field('provincia_nascita')
          .validation({ required: true, minlength: 2, maxlength: 2 }),
        nga.field('comune_residenza')
          .validation({ required: true }),
        nga.field('provincia_residenza')
          .validation({ required: true, minlength: 2, maxlength: 2 }),
        nga.field('reddito_730', 'template')
            .label('Reddito')
            .template(template730Insert),
        nga.field('totale_730_dichiarante', 'number')
						.attributes({ step: 'any' }).format('0.00')
            .label('Totale 730 dichiarante'),
        nga.field('totale_730_coniuge', 'number')
						.attributes({ step: 'any' }).format('0.00')
            .label('Totale 730 coniuge'),
        nga.field('totale_730', 'number')
            .label('Totale 730'),
        nga.field('beni_immobili', 'template')
            .label('Beni immobili')
            .template(templateBeniImmobiliInsert),
        nga.field('beni_mobili', 'template')
            .label('Beni mobili')
            .template(templateBeniMobiliInsert),
        nga.field('partecipazioni_soc', 'template')
            .label('Partecipazioni in società')
            .template(partecipazioniInsert),
        nga.field('amministrazioni_soc', 'template')
            .label('Ammistrazione di società')
            .template(amministrazioneInsert),
        nga.field('contributi_elettorali', 'template')
            .label('Contributi elettorali')
            .template(contributiInsert),
        nga.field('totale_contributi_elettorali', 'number')
						.attributes({ step: 'any' }).format('0.00')
            .label('Totale contributi elettorali'),
        nga.field('spese_elettorali', 'template')
            .label('Spese elettorali')
            .template(templateSpeseInsert),
        nga.field('quota_forfettaria_spese', 'number')
						.attributes({ step: 'any' }).format('0.00')
            .label('Quota forfettaria spese'),
        nga.field('totale_spese_elettorali', 'number')
						.attributes({ step: 'any' }).format('0.00')
            .label('Totale spese elettorali'),
        nga.field('dichiarazione_elettorale', 'boolean')
            .label('Dichiarazione elettorale'),
        nga.field('documenti_appello', 'boolean')
            .label('Documenti corte appello'),
        nga.field('dichiarazione_coniuge', 'boolean')
            .label('Dichiarazione coniuge'),
        nga.field('variazioni', 'boolean')
            .label('Variazioni'),
        nga.field('dichiarazioni_incomplete')
            .label('Dichiarazioni incomplete'),
        nga.field('modello_redditi')
            .label('Modello redditi'),
        nga.field('quadri_presentati')
            .label('Quadri presentati'),
        nga.field('note', 'wysiwyg'),
				nga.field('filename', 'file').uploadInformation({ 'url': 'http://patrimoni.openpolis.it/api/p/parlamentari/file/upload', 'apifilename': 'filename' })
						.label("File originale")
      ]);

    parlamentari.editionView()
      .title('Modifica dichiarazione "{{ entry.values.nome }} {{ entry.values.cognome }} {{ entry.values.anno_dichiarazione}}"') // title() accepts a template string, which has access to the entry
      .actions(['list', 'show', 'delete']) // choose which buttons appear in the top action bar. Show is disabled by default
      .fields([
        nga.field('anno_dichiarazione', 'number')
          .validation({ required: true, minlength: 4, maxlength: 4 }),
        nga.field('op_id')
          .validation({ required: true, minlength: 2 }),
        nga.field('nome') // the default edit field type is "string", and displays as a text input
          .attributes({ placeholder: 'Nome' }) // you can add custom attributes, too
          .validation({ required: true, minlength: 3, maxlength: 100 }), // add validation rules for fields
        nga.field('cognome') // the default edit field type is "string", and displays as a text input
          .attributes({ placeholder: 'Cognome' }) // you can add custom attributes, too
          .validation({ required: true, minlength: 3, maxlength: 100 }), // add validation rules for fields
        nga.field('data_nascita', 'date')
          //.format('dd-MM-yyyy') // 2006-01-02T15:04:05Z07:00 Date field type allows date formatting
          //.transform(utcfy) // FIXME update ng-admin version
          .map(utcfy)
          .label("Data di nascita"),
        nga.field('stato_civile', 'choice')
          .choices([
            { value: 'celibe', label: 'Celibe' },
            { value: 'nubile', label: 'Nubile' },
            { value: 'coniugato', label: 'Coniugato' },
          ])
          .validation({ required: true }),
        nga.field('comune_nascita')
          .validation({ required: true }),
        nga.field('provincia_nascita')
          .validation({ required: true, minlength: 2, maxlength: 2 }),
        nga.field('comune_residenza')
          .validation({ required: true }),
        nga.field('provincia_residenza')
          .validation({ required: true, minlength: 2, maxlength: 2 }),
        nga.field('reddito_730', 'template')
            .label('Reddito')
            .template(template730Edit),
        nga.field('totale_730_dichiarante', 'number')
						.attributes({ step: 'any' }).format('0.00')
            .label('Totale 730 dichiarante'),
        nga.field('totale_730_coniuge', 'number')
						.attributes({ step: 'any' }).format('0.00')
            .label('Totale 730 coniuge'),
        nga.field('totale_730', 'number')
						.attributes({ step: 'any' }).format('0.00')
            .label('Totale 730'),
        nga.field('beni_immobili', 'template')
            .label('Beni immobili')
            .template(templateBeniImmobiliEdit),
        nga.field('beni_mobili', 'template')
            .label('Beni mobili')
            .template(templateBeniMobiliEdit),
        nga.field('partecipazioni_soc', 'template')
            .label('Partecipazioni in società')
            .template(partecipazioniEdit),
        nga.field('amministrazioni_soc', 'template')
            .label('Ammistrazione di società')
            .template(amministrazioneEdit),
        nga.field('contributi_elettorali', 'template')
            .label('Contributi elettorali')
            .template(contributiEdit),
        nga.field('totale_contributi_elettorali', 'number')
						.attributes({ step: 'any' }).format('0.00')
            .label('Totale contributi elettorali'),
        nga.field('spese_elettorali', 'template')
            .label('Spese elettorali')
            .template(templateSpeseEdit),
        nga.field('quota_forfettaria_spese', 'number')
						.attributes({ step: 'any' }).format('0.00')
            .label('Quota forfettaria spese'),
        nga.field('totale_spese_elettorali', 'number')
						.attributes({ step: 'any' }).format('0.00')
            .label('Totale spese elettorali'),
        nga.field('dichiarazione_elettorale', 'boolean')
            .label('Dichiarazione elettorale'),
        nga.field('documenti_appello', 'boolean')
            .label('Documenti corte appello'),
        nga.field('dichiarazione_coniuge', 'boolean')
            .label('Dichiarazione coniuge'),
        nga.field('variazioni', 'boolean')
            .label('Variazioni'),
        nga.field('dichiarazioni_incomplete')
            .label('Dichiarazioni incomplete'),
        nga.field('modello_redditi')
            .label('Modello redditi'),
        nga.field('quadri_presentati')
            .label('Quadri presentati'),
        nga.field('note', 'wysiwyg'),
        nga.field('filename')
					.editable(false),
						// FIXME neighter map() works to add op_ip (it is triggered when whole form is submitted)
				nga.field('filename_rectification', 'file').uploadInformation({ 'url': 'http://patrimoni.openpolis.it/api/p/parlamentari/file/upload', 'apifilename': 'filename' })
						.label("File rettifica")
      ]);

    parlamentari.showView() // a showView displays one entry in full page - allows to display more data than in a a list
      .title('Dettaglio dichiarazione "{{ entry.values.nome }} {{ entry.values.cognome }} {{ entry.values.anno_dichiarazione}}"') // title() accepts a template string, which has access to the entry
      .fields([
        nga.field('id'),
        nga.field('anno_dichiarazione'),
        nga.field('op_id').label('ID openpolitici'),
        nga.field('nome'),
        nga.field('cognome'),
        nga.field('data_nascita', 'date')
          .format('dd-MM-yyyy')
          .label("Data di nascita"),
        nga.field('stato_civile')
          .label('Stato civile'),
        nga.field('comune_nascita'),
        nga.field('provincia_nascita'),
        nga.field('comune_residenza'),
        nga.field('provincia_residenza'),
        nga.field('reddito_730', 'template')
            .label('Reddito')
            .template(template730View),
        nga.field('beni_immobili', 'template')
            .label('Beni immobili')
            .template(templateBeniImmobiliView),
        nga.field('beni_mobili', 'template')
            .label('Beni mobili')
            .template(templateBeniMobiliView),
        nga.field('partecipazioni_soc', 'template')
            .label('Partecipazioni in società')
            .template(partecipazioniView),
        nga.field('amministrazioni_soc', 'template')
            .label('Ammistrazione di società')
            .template(amministrazioneView),
        nga.field('contributi_elettorali', 'template')
            .label('Contributi elettorali')
            .template(contributiView),
        nga.field('spese_elettorali', 'template')
            .label('Spese elettorali')
            .template(templateSpeseView),
        nga.field('dichiarazione_elettorale', 'boolean')
            .label('Dichiarazione elettorale'),
        nga.field('documenti_appello', 'boolean')
            .label('Documenti corte appello'),
        nga.field('dichiarazione_coniuge', 'boolean')
            .label('Dichiarazione coniuge'),
        nga.field('variazioni', 'boolean')
            .label('Variazioni'),
        nga.field('dichiarazioni_incomplete')
            .label('Dichiarazioni incomplete'),
        nga.field('modello_redditi')
            .label('Modello redditi'),
        nga.field('quadri_presentati')
            .label('Quadri presentati'),
        nga.field('note', 'wysiwyg'),
        nga.field('filename_url', 'template')
						.template(templateDownloadOrig)
						.label("File originale"),
        nga.field('filename_rectification_url', 'template')
						.template(templateDownloadRect)
						.label("File rettifica"),
      ]);


    admin.menu(nga.menu()
      .addChild(nga.menu(parlamentari).icon('<span class="glyphicon glyphicon-file"></span>')) // customize the entity menu icon
      .addChild(nga.menu().title('Other')
        .addChild(nga.menu().title('Stats').icon('').link('/stats'))
      )
    );

    nga.configure(admin);
  });

  app.directive('postLink', ['$location', function ($location) {
    return {
      restrict: 'E',
      scope: { entry: '&' },
      template: '<p class="form-control-static"><a ng-click="displayPost()">View&nbsp;post</a></p>',
      link: function (scope) {
        scope.displayPost = function () {
          $location.path('/show/posts/' + scope.entry().values.post_id);
        };
      }
    };
  }]);

  app.directive('sendEmail', ['$location', function ($location) {
    return {
      restrict: 'E',
      scope: { post: '&' },
      template: '<a class="btn btn-default" ng-click="send()">Send post by email</a>',
      link: function (scope) {
        scope.send = function () {
          $location.path('/sendPost/' + scope.post().values.id);
        };
      }
    };
  }]);

  // custom 'send post by email' page
  function sendPostController($stateParams, notification) {
    this.postId = $stateParams.id;
    // notification is the service used to display notifications on the top of the screen
    this.notification = notification;
  };
  sendPostController.prototype.sendEmail = function() {
    if (this.email) {
      this.notification.log('Email successfully sent to ' + this.email, {addnCls: 'humane-flatty-success'});
    } else {
      this.notification.log('Email is undefined', {addnCls: 'humane-flatty-error'});
    }
  }
  sendPostController.inject = ['$stateParams', 'notification'];

  var sendPostControllerTemplate =
    '<div class="row"><div class="col-lg-12">' +
      '<ma-view-actions><ma-back-button></ma-back-button></ma-view-actions>' +
      '<div class="page-header">' +
        '<h1>Send post #{{ controller.postId }} by email</h1>' +
        '<p class="lead">You can add custom pages, too</p>' +
      '</div>' +
    '</div></div>' +
    '<div class="row">' +
      '<div class="col-lg-5"><input type="text" size="10" ng-model="controller.email" class="form-control" placeholder="name@example.com"/></div>' +
      '<div class="col-lg-5"><a class="btn btn-default" ng-click="controller.sendEmail()">Send</a></div>' +
    '</div>';

  app.config(function ($stateProvider) {
    $stateProvider.state('send-post', {
      parent: 'main',
      url: '/sendPost/:id',
      params: { id: null },
      controller: sendPostController,
      controllerAs: 'controller',
      template: sendPostControllerTemplate
    });
  });

  // custom page with menu item
  var customPageTemplate = '<div class="row"><div class="col-lg-12">' +
      '<ma-view-actions><ma-back-button></ma-back-button></ma-view-actions>' +
      '<div class="page-header">' +
        '<h1>Stats</h1>' +
        '<p class="lead">You can add custom pages, too</p>' +
      '</div>' +
    '</div></div>';
  app.config(function ($stateProvider) {
    $stateProvider.state('stats', {
      parent: 'main',
      url: '/stats',
      template: customPageTemplate
    });
  });

}());
