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
		editTemplate: _.template($("#changeContactTemplate").html()),
  
		render: function () {
			var tmpl = _.template(this.template);
			this.$el.html(tmpl(this.model.toJSON()));
			return this;
		},
		
		events: {
			"click #delete": "deleteContact",
			"click #change": "editContact",
			"click #saveChanges": "saveEdits",
			"click #cancelChanges": "cancelEdit"
		},
		
		deleteContact: function () {
			var removedDepartment = this.model.get("department").toLowerCase();
			var removedPosition = this.model.get("position").toLowerCase();
			this.model.collection.remove(this.model);
		},
		
		editContact: function () {
			this.$el.html(this.editTemplate(this.model.toJSON()));
			contactsRouter.navigate("editContact");
		},
		
		saveEdits: function (e) {
			e.preventDefault();
			
			if (!this.$el.find('#changeName').val()) {
				return this.$el.find('#changeName').attr("placeholder","Не указано имя")
			}
			if (!this.$el.find('#changeDepartment').val()) {
				return this.$el.find('#changeDepartment').attr("placeholder","Не указан отдел")
			}
			if (!this.$el.find('#changePosition').val()) {
				return this.$el.find('#changePosition').attr("placeholder","Не указана должность")
			}
			if (!this.$el.find('#changeTel').val()) {
				return this.$el.find('#changeTel').attr("placeholder","Не указан телефон")
			}
			if (!this.$el.find('#changeEmail').val()) {
				return this.$el.find('#changeEmail').attr("placeholder","Не указан e-mail")
			}
		 
			var formData = {};
			formData.id=this.model.id;
			formData.name=$('#changeName').val();
			formData.department=this.$el.find('#changeDepartment').val();
			formData.position=this.$el.find('#changePosition').val();
			formData.tel=this.$el.find('#changeTel').val();
			formData.email=this.$el.find('#changeEmail').val();
			formData.photo=(formData.id+'.jpg');
			
			var prev = this.model.previousAttributes();
			delete prev.photo;
			
			this.model.set(formData);
		 
			this.render();
		 
			_.each(contacts, function (contact) {
				if (_.isEqual(contact, prev)) {
					contacts.splice(_.indexOf(contacts, contact), 1, formData);
				}
			directory.filterDepartment='Все';
			directory.filterPosition='Все';
			directory.filterByFilter();
			contactsRouter.navigate("filterDepartment=" + directory.filterDepartment +"/filterPosition="+directory.filterPosition);
			});
		},
		
		cancelEdit: function () {
			directory.filterDepartment='Все';
			directory.filterPosition='Все';
			directory.filterByFilter();
			contactsRouter.navigate("filterDepartment=" + directory.filterDepartment +"/filterPosition="+directory.filterPosition);
			this.render();
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
			this.collection.on("remove", this.removeContact, this);
			this.collection.on("change", this.updateSelect, this);
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
		"click #saveChanges": "saveChanges"
		},
		
		secondScreen: function () {
			this.$el.find('#addContact').show();
			contactsRouter.navigate("addContact");
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
			this.filterByFilter();
			contactsRouter.navigate("filterDepartment=" + this.filterDepartment +"/filterPosition="+this.filterPosition);
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
			newModel.id=this.collection.isEmpty()? 1 : (_.max(this.collection.pluck('id'))+1)
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
			};
			this.switchScreen();
			this.filterDepartment = "Все";
			this.filterPosition = "Все";
			this.trigger("change:filterType");
			this.updateSelect();
		},
		
		removeContact: function (removedModel) {
			var removed = removedModel.attributes;
			delete removed.photo;
			_.each(contacts, function (contact) {
				if (_.isEqual(contact, removed)) {
					contacts.splice(_.indexOf(contacts, contact), 1);
				}
			});
			this.$el.find("#filterDepartment").find("select").remove();
			this.$el.find("#filterDepartment").append(this.createDepartmentSelect());
			this.$el.find("#filterPosition").find("select").remove();
			this.$el.find("#filterPosition").append(this.createPositionSelect());
			this.filterDepartment = "Все";
			this.filterPosition = "Все";
			this.trigger("change:filterType");
			
		},
		
		setDepartmentFilter: function (e) {
			this.filterDepartment = e.currentTarget.value;
			this.trigger("change:filterType");
		},
		
		setPositionFilter: function (e) {
			this.filterPosition = e.currentTarget.value;
			this.trigger("change:filterType");
		},
		
		updateSelect: function () {
			this.$el.find("#filterDepartment").find("select").remove();
			this.$el.find("#filterDepartment").append(this.createDepartmentSelect());
			this.$el.find("#filterPosition").find("select").remove();
			this.$el.find("#filterPosition").append(this.createPositionSelect());
			this.filterDepartment = "Все";
			this.filterPosition = "Все";
			this.trigger("change:filterType");
		},
		
		filterByFilter: function () {
			if (this.filterDepartment === "Все") {
				if (this.filterPosition === "Все") {
					//Все отделы и все должности
					this.collection.reset(contacts);
					contactsRouter.navigate("filterDepartment=Все/filterPosition=Все");
				}
				else {
					// Все отделы, не все должности
					this.collection.reset(contacts, { silent: true });
					var filterType = this.filterPosition,
					filtered = _.filter(this.collection.models, function (item) {
						return item.get("position").toLowerCase() === filterType;
					});
					this.collection.reset(filtered);
					contactsRouter.navigate("filterPosition=" + filterType);
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
					contactsRouter.navigate("filterDepartment=" + filterType);					
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
					contactsRouter.navigate("filterDepartment=" + this.filterDepartment +"/filterPosition="+filterType);	
				}
			}
		}
	});
	
	
	
	var ContactsRouter = Backbone.Router.extend({
		routes: {
			"":"urlFilter",
			"editContact":"urlFilter",
			"filterDepartment=:department": "urlFilterDepartment",
			"filterPosition=:filters": "urlFilterPosition",
			"filterDepartment=:department/filterPosition=:position": "urlFilter",
			"addContact": "urlAddContact",
			"filterPosition=:filters": "urlFilterPosition"
		},
	 
		urlFilterDepartment: function (department) {
			directory.switchScreen();
			directory.filterDepartment = department;
			directory.filterPosition = "Все";
			directory.trigger("change:filterType");
		},
		urlFilterPosition: function (position) {
			directory.switchScreen();
			directory.filterDepartment = "Все";
			directory.filterPosition = position;
			directory.trigger("change:filterType");
		},
		urlFilter: function (department,position) {
			directory.switchScreen();
			directory.filterDepartment = department||"Все";
			directory.filterPosition = position||"Все";
			directory.trigger("change:filterType");
		},
		urlAddContact: function () {
			directory.secondScreen()
		}	
	});

	var directory = new DirectoryView();
	var contactsRouter = new ContactsRouter();
	Backbone.history.start();
} (jQuery));