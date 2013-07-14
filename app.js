/**
 * Created with JetBrains WebStorm.
 * User: brian
 * Date: 13/07/2013
 * Time: 17:40
 * To change this template use File | Settings | File Templates.
 */
function VirtualMarker()
{
    var self=this;
    self.name="";
    self.longitude=0;
    self.latitude=0;
    self.description="";
    self.type="";
    self.contentURL="";
}

var vModel;
var myParser;
var map;
var markers=new Array();
var playerHeading=270;


var cb = new Codebird();
cb.setConsumerKey("EBmEiAD1wlp5RCuGU1qQew", "QQKZlE9okih2ORjDRX2rC9XxCWWYhUBgKEs6TIck0c");
cb.setToken("19904136-3FvWv2oQiQcCRcERvXlURxp7Ruoqf1NN3Co5oZhFf", "6WYRK7roSX3bF9XUtvGrVTojHHAzZ2FT6vM7UPJwIw");

function viewModel(){
    var self = this;
    self.mapLongtitude=ko.observable(55.843314);
    self.mapLatitude=ko.observable(-4.280513);
    self.selectedPlaceName=ko.observable("");
    self.twitterScreenName=ko.observable("");
    self.tweets=ko.observableArray();
    self.twitterURL=ko.observable("");
    self.displayImage=ko.observable('');
    self.displayVideo=ko.observable('');

    self.selectedPlaceName.subscribe(function (newValue) {
        //twitter feed
        //GrabUserTweet(self.selectedPlaceName);
        //SearchForTwitterUser(self.selectedPlaceName);
        //pictures
        //video
    });
};

$(document).ready(function() {
    vModel=new viewModel();
    ko.applyBindings(vModel);
    CreateGoogleMap(55.843314,-4.280513);
    //grab the stuff
    $("#image").hide();
    $("#youtube").hide();
    $('#sound').hide();
    SC.initialize({
        client_id: 'b44a3c3538a9f5bcd082d6205b69e11d'
    });

    var track_url = 'https://soundcloud.com/albert-drive/kitchens';
    SC.oEmbed(track_url, { auto_play: true }, function(oEmbed) {
        console.log('oEmbed response: ' + oEmbed);
    });
});

function SearchForTwitterUser(name)
{
    var params={
        q:name
    };

    cb.__call(
        "users_search",
        params,
        function (reply) {
            console.log(reply);
        },true
    );
}
function GrabUserTweet(tweetId)
{
    var params={
        id:tweetId
    };
    cb.__call(
        "statuses_show_ID",
        params,
        function (reply) {
            console.log(reply);
        },true
    );
}

document.onkeydown = ShowKeyCode;
function ShowKeyCode(evt) {
    if (evt.keyCode=='38'){
        //map.getStreetView().followLink(playerHeading);
        moveForward();
    }
    else if (evt.keyCode=='40'){
        moveBackward();
    }
}

function difference(link) {
    return Math.abs(map.getStreetView().pov.heading%360 - link.heading);
}

function differenceBack(link){
    return Math.abs(((map.getStreetView().pov.heading%360)*-1) - link.heading);
}

function moveBackward(){
    var curr;
    for(i=0; i < map.getStreetView().links.length; i++) {
        var differ = difference(map.getStreetView().links[i]);
        if(curr == undefined) {
            curr = map.getStreetView().links[i];
        }

        if(difference(curr) > differenceBack(map.getStreetView().links[i])) {
            curr = curr = map.getStreetView().links[i];
        }
    }
    map.getStreetView().setPano(curr.pano);
}

function moveForward() {
    var curr;
    for(i=0; i < map.getStreetView().links.length; i++) {
        var differ = difference(map.getStreetView().links[i]);
        if(curr == undefined) {
            curr = map.getStreetView().links[i];
        }

        if(difference(curr) > difference(map.getStreetView().links[i])) {
            curr = curr = map.getStreetView().links[i];
        }
    }
    map.getStreetView().setPano(curr.pano);
}

function CreateGoogleMap(longitutde,latitude)
{
    var mapDiv = document.getElementById('googleMap');
    var mapOptions = {
        zoom: 15,
        center: new google.maps.LatLng(longitutde,latitude),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var mapDiv = document.getElementById('googleMap');
    map = new google.maps.Map(mapDiv, mapOptions);
    CreateKMLMapOverlay(map);
    map.getStreetView().setPosition(new google.maps.LatLng(longitutde,latitude));
    map.getStreetView().setVisible(true);
    map.getStreetView().setPov(/** @type {google.maps.StreetViewPov} */({
        heading: playerHeading,
        pitch: 0
    }));

}

function CreateKMLMapOverlay(googleMap)
{
    myParser = new geoXML3.parser({map: googleMap,
        processStyles: true,
        createMarker: addMyMarker,
        createOverlay: addMyOverlay
    });
    myParser.parse(["/resources/Albert Drive Public Spaces.kml","/resources/Albert Drive Media Static.kml"]);
}

function addUserMarker()
{

}

function addMyMarker(placemark) {
    // Marker handling code goes here
    //myParser.createMarker(placemark);
    marker = new google.maps.Marker({
        map:map,
        draggable:false,
        animation: google.maps.Animation.DROP,
        position:new google.maps.LatLng(placemark.point.lat, placemark.point.lng),
        title:placemark.name,
        icon:placemark.style.icon
    });
    google.maps.event.addListener(marker, 'click',iconClicked);

    var vm=new VirtualMarker();
    vm.latitude=placemark.point.lat;
    vm.longitude=placemark.point.lng;
    vm.name=placemark.name;
    vm.description=placemark.description;

    //check the description,
    var str=vm.description.substr(0,3);

    if (str=="URL")
    {
        var contentURL=vm.description.substr(5);
        trim1(contentURL);
        console.log(contentURL);
        vm.contentURL=contentURL;
        if (vm.description.indexOf("sound")>0)
        {
            vm.type="sound";
        }
        else if (vm.description.indexOf("you")>0)
        {
            vm.type="video";
        }
        else
        {
            vm.type="image";
        }
    }
    else
    {
        vm.type="place";
    }

    markers.push(vm);
    //console.log(vm);
    //myParser.createMarker(placemark);
};

function trim1 (str) {
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

function addMyOverlay(groundOverlay) {
    // Overlay handling code goes here
    myParser.createOverlay(groundOverlay);
}

function iconClicked(eventClick)
{
    var marklngLat;
    mouselngLat=eventClick.latLng;
    for(var i=0;i<markers.length;i++)
    {
        if (mouselngLat.jb==markers[i].latitude && mouselngLat.kb==markers[i].longitude)
        {
            vModel.selectedPlaceName(markers[i].name);
            console.log(markers[i]);
            if (markers[i].type=="video")
            {
                console.log("video "+markers[i]);
                vModel.displayVideo(markers[i].contentURL);
                $("#image").hide();
                $("#youtube").show();
                $('#sound').hide();
            }
            else if(markers[i].type=="sound")
            {
                console.log("sound "+markers[i]);
                $("#image").hide();
                $("#youtube").hide();
                $('#sound').show();
            }
            else if (markers[i].type=="image")
            {
                console.log("image "+markers[i].contentURL);
                vModel.displayImage(markers[i].contentURL);
                $("#image").show();
                $("#image").removeAttr('style');
                $("#image").css({ top:'-480px',left:'600px'});
                $("#youtube").hide();
                $('#sound').hide();
            }
        }
    }



}