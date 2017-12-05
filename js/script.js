(function ($) {
 
    var contacts = [
        { id: 1, name: "Калинкин Евгений Федорович", department: "Менеджмента", position: "Администратор", tel: "8029-486-75-36", email: "kef@mail.ru"},
        { id: 2, name: "Родникова Светлана Ивановна", department: "Менеджмента", position: "Секретарь", tel: "8025-784-68-42", email: "rsi@gmail.com"},
        { id: 3, name: "Мельников Игорь Маркович", department: "Менеджмента", position: "Менеджер", tel: "8044-743-95-14", email: "mim@tut.by"},
        { id: 4, name: "Григорьев Михаил Афанасьевич", department: "Транспорта", position: "Водитель", tel: "8033-746-87-63", email: "gma@mail.ru"},
        { id: 5, name: "Алегрова Ирина Олеговна", department: "Транспорта", position: "Водитель", tel: "8025-631-74-58", email: "aio@gmail.com"},
        { id: 6, name: "Оладушкин Николай Генадьевич", department: "Транспорта", position: "Менеджер", tel: "8029-886-74-53", email: "ong@tut.by"}
    ];
	
	var Contact = Backbone.Model.extend({
		defaults: {
			photo: "placeholder.png"
		},
		initialize: function(){
			this.set('photo', this.id + '.jpg');
		}
	});
	
	var Directory = Backbone.Collection.extend({
		model: Contact
	});
	
	var ContactView = Backbone.View.extend({
		tagName: "article",
		className: "contact-container",
		template: $("#contactTemplate").html(),
	 
		render: function () {
			var tmpl = _.template(this.template);
			this.$el.html(tmpl(this.model.toJSON()));
			return this;
		}
	});
	
	var DirectoryView = Backbone.View.extend({
		el: $("#contacts"),
	 
		initialize: function () {
			this.collection = new Directory(contacts);
			this.render();
			this.$el.find("#filterDepartment").append(this.createDepartmentSelect());
			this.$el.find("#filterPosition").append(this.createPositionSelect());
			this.on("change:filterType", this.filterByFilter, this);
			this.collection.on("reset", this.render, this);
			this.collection.on("add", this.renderContact, this);
		},
	 
		render: function () {
            this.$el.find("article").remove();
			_.each(this.collection.models, function (item) {
				this.renderContact(item);
			}, this);
		},
	 
		renderContact: function (item) {
			var contactView = new ContactView({
				model: item
			});
			this.$el.append(contactView.render().el);
		},
		
		getDepartment: function () {
			return _.uniq(this.collection.pluck("department"), false, function (department) {
				return department.toLowerCase();
			});
		},
		 
		createDepartmentSelect: function () {
			var filter = this.$el.find("#filterDepartment"),
				select = $("<select/>", {
					html: "<option>Все</option>"
				});
		 
			_.each(this.getDepartment(), function (item) {
				var option = $("<option/>", {
					value: item.toLowerCase(),
					text: item.toLowerCase()
				}).appendTo(select);
			});
			return select;
		},
	
		getPosition: function () {
			return _.uniq(this.collection.pluck("position"), false, function (position) {
				return position.toLowerCase();
			});
		},
		 
		createPositionSelect: function () {
			var filter = this.$el.find("#filterPosition"),
				select = $("<select/>", {
					html: "<option>Все</option>"
				});
		 
			_.each(this.getPosition(), function (item) {
				var option = $("<option/>", {
					value: item.toLowerCase(),
					text: item.toLowerCase()
				}).appendTo(select);
			});
			return select;
		},
		
		events: {
		"change #filterPosition select": "setPositionFilter",
		"change #filterDepartment select": "setDepartmentFilter",
		"click #switch": "secondScreen",
		"click #cancel": "switchScreen",
		"click #add": "addNew",
		"click #delete": "deleteContact",
		"click #change": "changeContact"
		},
		
		secondScreen: function () {
			this.$el.find('#addContact').show();
		},
		
		switchScreen: function () {
			this.$el.find('#addName').val('');
			this.$el.find('#addDepartment').val('');
			this.$el.find('#addPosition').val('');
			this.$el.find('#addTel').val('');
			this.$el.find('#addEmail').val('');
			this.$el.find('#addName').attr("placeholder","");
			this.$el.find('#addDepartment').attr("placeholder","");
			this.$el.find('#addPosition').attr("placeholder","");
			this.$el.find('#addTel').attr("placeholder","");
			this.$el.find('#addEmail').attr("placeholder","");
			this.$el.find('#addContact').hide();
		},
		
		addNew: function (e) {
			e.preventDefault();
			this.collection.reset(contacts, { silent: true });
			if (!this.$el.find('#addName').val()) {
				return this.$el.find('#addName').attr("placeholder","Не указано имя")
			}
			if (!this.$el.find('#addDepartment').val()) {
				return this.$el.find('#addDepartment').attr("placeholder","Не указан отдел")
			}
			if (!this.$el.find('#addPosition').val()) {
				return this.$el.find('#addPosition').attr("placeholder","Не указана должность")
			}
			if (!this.$el.find('#addTel').val()) {
				return this.$el.find('#addTel').attr("placeholder","Не указан телефон")
			}
			if (!this.$el.find('#addEmail').val()) {
				return this.$el.find('#addEmail').attr("placeholder","Не указан e-mail")
			}
			var newModel = {};
			newModel.name=this.$el.find('#addName').val();
			newModel.department=this.$el.find('#addDepartment').val();
			newModel.position=this.$el.find('#addPosition').val();
			newModel.tel=this.$el.find('#addTel').val();
			newModel.email=this.$el.find('#addEmail').val();
			contacts.push(newModel);
			if (_.indexOf(this.getDepartment(), newModel.department) === -1) {
				if (_.indexOf(this.getPosition(), newModel.position) === -1) {	
					//Отдел и должность
					this.collection.add(new Contact(newModel));
					this.$el.find("#filterDepartment").find("select").remove();
					this.$el.find("#filterDepartment").append(this.createDepartmentSelect());
					this.$el.find("#filterPosition").find("select").remove();
					this.$el.find("#filterPosition").append(this.createPositionSelect());
				} else {
					//Отдел, но не должность
					this.collection.add(new Contact(newModel));
					this.$el.find("#filterDepartment").find("select").remove();
					this.$el.find("#filterDepartment").append(this.createDepartmentSelect());
				}
			} else {
				if (_.indexOf(this.getPosition(), newModel.position) === -1) {	
					//Не отдел, но должность
					this.collection.add(new Contact(newModel));
					this.$el.find("#filterPosition").find("select").remove();
					this.$el.find("#filterPosition").append(this.createPositionSelect());
				} else {
					//Не отдел и не должность
					this.collection.add(new Contact(newModel));
				}
			}
		},
		
		setDepartmentFilter: function (e) {
			this.filterDepartment = e.currentTarget.value;
			this.trigger("change:filterType");
		},
		
		setPositionFilter: function (e) {
			this.filterPosition = e.currentTarget.value;
			this.trigger("change:filterType");
		},
		
		filterByFilter: function () {
			if (this.filterDepartment === "Все") {
				if (this.filterPosition === "Все") {
					//Все отделы и все должности
					this.collection.reset(contacts);
					contactsRouter.navigate("filterDepartment/Все/filterPosition/Все");
				}
				else {
					// Все отделы, не все должности
					this.collection.reset(contacts, { silent: true });
					var filterType = this.filterPosition,
					filtered = _.filter(this.collection.models, function (item) {
						return item.get("position").toLowerCase() === filterType;
					});
					this.collection.reset(filtered);
					contactsRouter.navigate("filterPosition/" + filterType);
				};
			}
			else {
				if (this.filterPosition === "Все") {
					//Не все отделы, все должности
					this.collection.reset(contacts, { silent: true });
					var filterType = this.filterDepartment,
					filtered = _.filter(this.collection.models, function (item) {
						return item.get("department").toLowerCase() === filterType;
					});
					this.collection.reset(filtered);
					contactsRouter.navigate("filterDepartment/" + filterType);					
				}
				else {
					//Не все отделы и не все должности
					this.collection.reset(contacts, { silent: true });
					var filterType = this.filterDepartment,
					filtered = _.filter(this.collection.models, function (item) {
						return item.get("department").toLowerCase() === filterType;
					});
					filterType = this.filterPosition,
					filtered = _.filter(filtered, function (item) {
						return item.get("position").toLowerCase() === filterType;
					});
					this.collection.reset(filtered);
					contactsRouter.navigate("filterDepartment/" + this.filterDepartment +"/filterPosition/"+filterType);	
				}
			}
		}
	});
	
	var ContactsRouter = Backbone.Router.extend({
		routes: {
			"":"urlFilter",
			"filterDepartment/:department": "urlFilterDepartment",
			"filterPosition/:filters": "urlFilterPosition",
			"filterDepartment/:department/filterPosition/:position": "urlFilter"
		},
	 
		urlFilterDepartment: function (department) {
			directory.filterDepartment = department;
			directory.filterPosition = "Все";
			directory.trigger("change:filterType");
		},
		urlFilterPosition: function (position) {
			directory.filterDepartment = "Все";
			directory.filterPosition = position;
			directory.trigger("change:filterType");
		},
		urlFilter: function (department,position) {
			directory.filterDepartment = department||"Все";
			directory.filterPosition = position||"Все";
			directory.trigger("change:filterType");
		}	
	});

	var directory = new DirectoryView();
	var contactsRouter = new ContactsRouter();
	Backbone.history.start();
} (jQuery));