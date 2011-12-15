var ListView = Backbone.View.extend({

    model: new Backbone.Model

  , el: $('#content')

  , events: {
        'click #add': 'addItem'
    }

  , initialize: function() {
        this.counter = 0
        _.bindAll(this,'render','addItem')
        this.render()
    }

  , render: function() {
        this.el.append("<button id='add'>Add list item</button>")
        this.el.append("<ul></ul>")
    }

  , addItem: function(){
        console.log('Add Item')
        this.counter++
        $('ul', this.el).append("<li>hello world "+this.counter+"</li>")
    }
})

