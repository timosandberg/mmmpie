/*jslint white:true, forin:true, browser:true, unparam:true*/
/*global document,window,tinycolor*/

"use strict";

/**
 * All I want is pie
 * 
 * @author Timo Sandberg <timo.sandberg@iki.fi>
 * @class Pie 
 */
var Pie = function (opts) {

    var me = this;

    me.options = {
        "target": "pie",
        "showtext": true,
        "showlegend": true,
        "castshadow": true,

        "piedata": [],
        "textcolor": "#666666",
        "font": "Arial",
        "fontsize": "14px"
    };
    
    me.initialize = function (options) {

        var key, wrapper, w, h, el;
        for (key in options) {
            me.options[key] = options[key];
        }
        
        if (me.options.target) {
            wrapper = document.getElementById(me.options.target);
            w = window.getComputedStyle(wrapper).getPropertyValue("width").replace("px", "");
            h = window.getComputedStyle(wrapper).getPropertyValue("height").replace("px", "");

            me.width = (w > 0 ? w : 640);
            me.height = (h > 0 ? h : me.width);

            wrapper.innerHTML = "<canvas width='"+me.width+"' height='"+me.height+"'></canvas>";
            wrapper.innerHTML += "<div class='aiwip-legend'></div>";

            el = wrapper.getElementsByTagName("canvas")[0];

            if (me.options.showlegend) {
                me.legend = wrapper.getElementsByTagName("div")[0];
            }

            el.onclick = function (a) { me.onClick(a); };

            me.radius = (me.width - 20) / 2; // 20px padding
            me.origo = me.width / 2;
            me.canvas = el.getContext("2d");

            if (me.options.castshadow) { me.castShadow(); }

            me.sortPiedata();
            me.draw();
        }
    };

    me.castShadow = function () {
        me.canvas.beginPath();
        me.canvas.arc(me.origo, me.origo, me.radius-2, 0, 2*Math.PI, false);
        me.canvas.fillStyle = "#999999";
        me.canvas.shadowColor = "#666666";
        me.canvas.shadowOffsetX = 2;
        me.canvas.shadowOffsetY = 2;
        me.canvas.shadowBlur = 15;
        me.canvas.fill();
        me.canvas.stroke();

        me.canvas.shadowColor = "";
        me.canvas.shadowOffsetX = "";
        me.canvas.shadowOffsetY = "";
        me.canvas.shadowBlur = "";
    };

    me.sortPiedata = function () {
        me.options.piedata.sort(function (a, b) {
            return a.value - b.value;
        });
    };

    me.onClick = function (event) {
        var 
            clickX = event.offsetX - me.origo,
            clickY = event.offsetY - me.origo,
            distance = Math.sqrt(clickX*clickX + clickY*clickY),
            angle, rad, i, pie;

        if (distance > me.radius) { return; }

        angle = Math.atan(clickY / clickX) * (180/Math.PI);

        if (clickX > 0 && clickY < 0) {
            angle = 360 + angle;
        }
        /*
        if (clickX > 0 && clickY > 0) {
            //do nothing
        }
        */
        if (clickX < 0 && clickY > 0) {
            angle = 180 + angle;
        }
        if (clickX < 0 && clickY < 0) {
            angle = 180 + angle;
        }
        rad = (angle * (Math.PI/180) / Math.PI);

        for (i = 0; i < me.options.piedata.length; i += 1) {
            pie = me.options.piedata[i];
            if (rad >= pie.start && rad <= pie.stop) {
                console.log(pie);
                me.selected = i;
                // me.draw();
            }
        }
    };
    
    me.draw = function () {
        var 
            pos = 0,
            total = 0,
            i = 0,
            piestart = 0,
            piestop = 0,
            color;

        for (i = 0; i < me.options.piedata.length; i += 1) {
            total += parseInt(me.options.piedata[i].value, 10);
        }
        
        for (i = 0; i < me.options.piedata.length; i += 1) {
            piestart = pos;
            me.options.piedata[i].percent = 100 * parseInt(me.options.piedata[i].value, 10) / total;
            piestop = pos + (2 * (me.options.piedata[i].percent / 100));
            me.options.piedata[i].textpos = pos + (piestop-piestart) / 2;

            me.options.piedata[i].index = i;
            me.options.piedata[i].start = piestart;
            me.options.piedata[i].stop = piestop;

            color = me.options.piedata[i].color || me.generateColor();

            me.drawPie(i, piestart, piestop, color);

            if (me.options.showlegend) { me.addLegend(me.options.piedata[i], color); }
            pos = piestop;
        }
        if (me.options.showtext) {
            for (i = 0; i < me.options.piedata.length; i += 1) {
                me.pieText(me.options.piedata[i].textpos, me.options.piedata[i].name + " (" + Math.round(me.options.piedata[i].percent) + "%)");
            }
        }
    };

    me.generateColor = function () {
 	    var 
            angle = Math.round(Math.random() * 360),
            sat = 40 + Math.round(Math.random() * 20),
            lum = 70 + Math.round(Math.random() * 20),
            color = tinycolor("hsl(" + angle + ", "+sat+"%, "+lum+"%)");

        return color.toHex();
    };

    me.addLegend = function (pie, color) {
        var legend = "<div class='aiwip-legend-item' data-index='"+pie.index+"'>";

        legend += "<div class='aiwip-legend-colorbox' style='background-color: #"+color+";'></div>";
        legend += pie.name + " ";
        legend += "<span class='aiwip-legend-value'>("+pie.value+")</span> ";
        legend += "<span class='aiwip-legend-percent'>["+Math.round(pie.percent)+"%]</span> ";
        legend += "</div>";

        me.legend.innerHTML += legend;
    };
    
    me.drawPie = function (index, start, stop, color) {
        start = start * Math.PI || 0;
        stop = stop * Math.PI || Math.PI * 0.5;
        color = color || "#d3d3d3";
        
        me.canvas.fillStyle = "#"+color;
        me.canvas.strokeStyle = "#"+color;

        me.canvas.beginPath();
        me.canvas.moveTo(me.origo, me.origo);
        me.canvas.arc(me.origo, me.origo, me.radius, start, stop, false);
        me.canvas.lineTo(me.origo, me.origo);
        me.canvas.fill();

        me.canvas.stroke();
    };
    
    me.pieText = function (radians, text) {
        var 
            radius = me.radius * 0.625,
            angle = (Math.PI * radians),
            x = me.radius + (radius * Math.cos(angle)),
            y = me.radius + (radius * Math.sin(angle));
        me.canvas.fillStyle = me.options.textcolor;
        me.canvas.font = me.options.fontsize + " " + me.options.font;
        me.canvas.textAlign = "center";
		me.canvas.textBaseline = "middle";
        me.canvas.fillText(text, x, y);
    };    
    
    me.initialize(opts);
};
