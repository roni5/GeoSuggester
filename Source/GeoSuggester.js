/*
---
description: GeoSuggester

license: MIT-style

authors:
- Sergio Panagia (http://panaghia.it)

requires:
- Element.Event
- Fx.Tween
- Element.Style
- Element.Dimenstions
- String
- Array

- Google Maps API V3

provides: [GeoSuggester.js, GeoSuggester.css]

...
*/

var GeoSuggester = new Class({
	Implements: [Options, Events],
    options: {
       	suggest: "",
    	geocoder: null,
    	center: null,
    	map: null,
	    cache : '',
	    marker : null,
	    inputItem: null,
	    zoomLevel: 12,
	    mapCanvas: null,
		customClass: '_map_canvas',
		container:null,
	    rollHeight: '350',
	    initText: "Insert street",
	    hideOnBlur : false,
		baloonMsg: null,
		delay: 600,
		
	    
		results: null,
	    postalCode: null,
	    street_number: null,
	    route: null,
	    locality: null,
	    country: null,
	    admin_area_1: null,
	    admin_area_2: null,
		latitude: null,
		longitude: null
	    },
	    initialize: function(options)
		{
			this.setOptions(options);
			
			this.marker = new google.maps.Marker({
				title:"GeoSuggester"
			});
			this.init();
  		},
  		getUnsortedResults: function()
  		{
  			return this.options.results;
  		},
		getPostalCode: function()
		{
			return this.options.postalCode;
		},
		getStreetNumber: function()
		{
			return this.options.street_number;
		},
		getRoute: function()
		{
			return this.options.route;
		},
		getLocality: function()
		{
			return this.options.locality;
		},
		getCountry: function()
		{
			return this.options.country;
		},
		getAdminArea1: function()
		{
			return this.options.admin_area_1;
		},
		getAdminArea2: function()
		{
			return this.options.admin_area_2;
		},
		getLatitude: function()
		{
			return this.options.latitude;
		},
		getLongitude: function()
		{
			return this.options.longitude;
		},
  		init:function ()
  		{
			var initText = this.options.initText;
			var cache = this.options.cache;
			var hideOnBlur = this.options.hideOnBlur;  
			
			var inputItem = document.id(this.options.inputItem);
			inputItem.addEvent('mouseenter', function()
			{
				mouseOverMapCanvas = true;				
			});
			inputItem.addEvent('mouseleave', function()
			{
				mouseOverMapCanvas = false;				
			});
			inputItem.set('value', this.options.initText);
			inputItem.addEvent('blur', function()
		  	{
		  		if(hideOnBlur)
		  		{
		  			mapCanvas.tween('height',0);
		  		}
		  	});

			inputItem.addEvent('focus', function()
			{
				if(inputItem.get('value')==initText)
					inputItem.set('value','');
			}); 
			
			var mapCanvas = new Element('div',
			{
				'class': this.options.customClass,
				styles:
				{
					'position':'absolute',
					'top': (inputItem.getSize().y+2)+'px',
					'width': inputItem.getSize().x+'px'			
				}
				
			}).inject(document.id(this.options.container)); 
			this.options.mapCanvas = mapCanvas;            
			
			
		  			
			  			
  			var rollHeight = this.options.rollHeight;	    
  			var zoomLevel = this.options.zoomLevel;
			
			
			var mouseOverMapCanvas = false;
			mapCanvas.addEvent('mouseenter', function()
			{
				mouseOverMapCanvas = true;
			});
			mapCanvas.addEvent('mouseleave', function()
			{
				mouseOverMapCanvas = false;
			});
			
			
			document.id(document.body).addEvent('click', function()
			{
				if (!mouseOverMapCanvas)
				{
					mapCanvas.tween('height',0);
				}
			});
   		
			inputItem.addEvent('keydown', function(event)
			{
				
				if(event.key=='esc')
				{
					this.fireEvent('clear');
					inputItem.set('value','');
					mapCanvas.tween('height',0);   				
				}
				else if(event.key == 'enter' || event.key == 'tab')
				{
					this.extract(this.options.results);
				}
				else if(inputItem.get('value').length>5 )
				{
					this.options.timer = 0; //reset timer
					(function()
					{
						var address = inputItem.get('value');
						geocoder = new google.maps.Geocoder();
						if(geocoder)
						{
							
							geocoder.geocode( {'address':address}, function(results, status)
							{ 
								//console.log('out');
							    (function(){
								if(status == google.maps.GeocoderStatus.OK)
								{
									center = results[0].geometry.location;
									if(cache.toString()!=center.toString()) //just a bit of cache
									{
										this.options.results = results;
										var type = results[0].geometry.location_type;
										suggest = results[0].formatted_address;
																		
										if(type != 'APPROXIMATE')
										{
											var myOptions =
											{
										      zoom: zoomLevel,
										      center: center,
										      mapTypeId: google.maps.MapTypeId.ROADMAP
											}
										
											if(mapCanvas.getSize().y != rollHeight)
											{
												mapCanvas.setStyle('height',rollHeight+'px'); 
												
											}
											map = new google.maps.Map(mapCanvas, myOptions);
																				
											marker = new google.maps.Marker({
												map: map, 
												position: results[0].geometry.location
											});
										
											if(this.options.baloonMsg == null)
												var baloonMsg = '<span id="baloonMsg">Press Enter or click on the marker when<br/>it indicates the right position</span>';
											else
												var baloonMsg = this.options.baloonMsg;
			
											/*var baloon = new google.maps.InfoWindow({
											content: baloonMsg
											});
											baloon.open(map, marker);
											                              */
											if(!document.id('_map_hud'))
											{
												var mapCanvasHUD = new Element('div',
												{
													'id':'_map_hud',
													styles:
													{
														'position':'absolute',
														'top':'20px',
														'left':'80px',
														'width':'auto',
														'backgroundColor':'#333',
														'color':'#fff',
														'z-index':'999',
														'border-radius':'15px',
														'padding-left':'8px',
														'padding-right':'8px',
														'padding-top':'4px',
														'padding-bottom':'4px',
														'font-size':'.8em'
													},
													html:baloonMsg

												}).inject(mapCanvas); 
											}
										
										  /*  google.maps.event.addListener(marker, 'click', function() {
											    baloon.close();
											    //map.setZoom(16);
											 }); */
									
											google.maps.event.addListener(marker, 'click', function(){								
												this.extract(results); 							
											}.bind(this));
										
																				
										}
									}
									cache = results[0].geometry.location;
								}
								
							}.bind(this)).delay(1000);
								
							}.bind(this));//end geocode
						} //Endif 
					
					}.bind(this)).delay(this.options.delay);
				}
			}.bind(this)); //end eventlistener
			
		},//end fun
		extract:function(results)
		{
			var inputItem = document.id(this.options.inputItem);
			var mapCanvas = document.id(this.options.mapCanvas);
			var k=0;
		
			this.options.latitude = results[0].geometry.location.lat();
			this.options.longitude = results[0].geometry.location.lng();
			
			for(k=0;k<results[0].address_components.length;k++)
			{
				var cur = results[0].address_components[k];
				var curType = cur.types[0];
				
				switch(curType)
				{
					case 'postal_code': this.options.postalCode = cur.short_name;
						break;
					case 'street_number': this.options.street_number = cur.short_name;
						break;
					case 'route': this.options.route = cur.short_name;
						break;
					case 'locality': this.options.locality = cur.short_name;
						break;
					case 'administrative_area_level_1': this.options.admin_area_1 = cur.long_name;
						break;
					case 'administrative_area_level_2': this.options.admin_area_2 = cur.long_name;
						break;
					case 'country': this.options.country = cur.long_name = cur.long_name;
						break;
					default:
						break;
				}	
				
				
			}
								
			inputItem.set('value',suggest);
			inputItem.focus();
			inputItem.select();
			mapCanvas.tween('height',0);
			this.fireEvent('select');
		}
	});





		
    	
