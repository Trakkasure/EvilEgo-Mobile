
//ppt = getTemplate('templates/playerProfile.html','playerProfileTemplate')
PlayerView = Backbone.View.extend({
    el: $('#player')

  , events: {
        'tap #loginSubmit'  : 'authenticate'
      , 'change #loginName' : 'setLogin'
      , 'change #password'  : 'setPassword'
      , 'change #save    '  : 'setSave'
    }

  , initialize: function() {
        _.bindAll(this,'authenticate','setLogin','setPassword','setSave','render')
        this.template = '#playerProfileTemplate'
        //console.log('Init LoginView')
        this.render()
        this.model.bind('change:login',function(o,val){
            //console.log(o.get('login')+':'+val)
            if (o.get('login')!=val)
                $('#loginName').val(val)
        })
    }
  , render: function() {
        $(this.el).html($.tmpl($(this.template).html(),this.model.toJSON())).trigger('create')
    }
})

