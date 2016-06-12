/**
 *  @Class RegionSelection 
 *  this enables the region to have selection behaviour
 *  The parent shall be a d3.select('svg') behaviour for the selection
 *  So, it has three selection 'rectangle', 'brush' and 'polygon'
 *  See before for further explanation
 *  @TODO change the cursor style
 *  @TODO convert the region selection into mask with scale and translation
 */
const RegionSelection = function(parent){
    this.parent = parent;
    this.height = 600;
    this.width = 600;
    this.area = this.parent.append('svg:svg')
                    .classed('selection', true)
                    .attr('height', this.height).attr('width', this.width);
}

/**
 *  The rectangle selection will allow user to specify a rectangle region by dragging.
 *  The return value will be contain {x:int,y:int,height:int,width:int} relative to canvas
 */
RegionSelection.prototype.rectangle_selection = function(){
    if (this.selector){
        this.clear_selected();
    }
    // selector will store the result
    this.selector = this.area.append('rect')
        .datum({x: 0, y:0, height: 0, width: 0, type: 'rectangle'})
        .attr('stroke','grey')
        .attr('stroke-dasharray', '4px')
        .attr('fill', 'white')
        .attr('fill-opacity', 0.3);
    const selector = this.selector;
    this.area.on('mousedown.select', function(){
        d3.event.stopPropagation();
        const p = d3.mouse(this);
        const d = selector.datum();
        d.x = p[0];
        d.y = p[1];
        d.height = 0;
        d.width = 0;
        selector.attr('height', d.height).attr('width', d.width)
                    .attr('x', d.x).attr('y', d.y).classed('dragging', true);
    }).on('mousemove.select', function(){
        if (selector.classed('dragging')){
            const p = d3.mouse(this);
            const d = selector.datum();
            d.width = p[0]-d.x;
            d.height = p[1]-d.y;
            selector.attr('height', Math.abs(d.height)).attr('width', Math.abs(d.width))
                .attr('x', d.width>0 ? d.x : d.x+d.width).attr('y', d.height>0 ? d.y : d.y+d.height);
        }
    }).on('mouseup.select', function(){
        selector.classed('dragging', false);
        
    });
}

/**
 *  stroke selection is by user dragging repeatedly 
 *  stroke selection will be a canvas 
 *  the data it returns include {data:imageData}
 */
RegionSelection.prototype.stroke_selection = function(){
    if (this.selector){
        this.clear_selected();
    }
    this.selector = this.area.append('foreignObject')
                            .attr('height', '100%').attr('width', '100%')
                            .datum({type: 'stroke', data: null});
    var canvas = this.selector.append('xhtml:canvas')
                        .style('opacity', 0.5)
                        .attr('height', this.area.style('height'))
                        .attr('width', this.area.style('width'));
    const selector = this.selector;
    const ctx = canvas.node().getContext('2d');
    const pts = [];
    const data = selector.datum();
    const height = parseInt(this.area.style('height'), 10);
    const width = parseInt(this.area.style('width'), 10);

    ctx.strokeStyle = 'orange';
    ctx.lineWidth = 30;
    // to make the line joint and smooth
    ctx.lineCap = ctx.lineJoin = 'round';
    this.area.on('mousedown.select', function(){
        d3.event.stopPropagation();
        selector.classed('dragging', true);
        pts.length = 0;
        const p = d3.mouse(this);
        ctx.moveTo(p[0], p[1]);
        pts.push(pts)
    }).on('mousemove.select', function(){
        // use the bezier curve for brushing 
        // accumulate three points and draw a bazier curve interpolation
        if(selector.classed('dragging')){
            const p = d3.mouse(this);
            pts.push(p);
            if (pts.length == 3){
                ctx.beginPath();
                ctx.bezierCurveTo(pts[0][0], pts[0][1], pts[1][0], pts[1][1], pts[2][0], pts[2][1]);
                ctx.stroke();
                pts.length = 0;
                ctx.moveTo(p[0], p[1]);
                pts.push(p);
            }
        }
    }).on('mouseup.select', function(){
        selector.classed('dragging', false);
        pts.length = 0;
        data.data = ctx.getImageData(0, 0, width, height);
    });
}

/**
 *  The point selection will allow user to create a polygon. 
 *  It does not check if it is convex though
 *  The user could click on the screen and create points
 *  if user click on points, if it close the polygon (first points), an polygon will form
 *  and the polygon will be closed
 *  if user click on other points, the polygon will cancle till that point
 *  The data created will be {points:[[x:int, y:int]](array of points (2 elements array)), closed: bool}
 */
RegionSelection.prototype.point_selection = function(){
    if (this.selector){
        this.clear_selected();
    }
    // datum: points [2d array] circles: d3.select('circles'), lines: d3.select('lines')
    this.selector = this.area.append('svg:g').classed('selection', true)
                    .attr('height', '100%').attr('width', '100%')
                    .datum({points: [], circles: [], lines: [], closed: true, type: 'polygon'});
    const selector = this.selector;
    const d = selector.datum();

    this.area.on('click.select', function(){
        var p = d3.mouse(this); 
        if(d.closed){
            // clear all the points and start over again
            d.closed = false;
            selector.select('polygon.select').remove(); 
            d.lines.length = 0;
            d.points.length = 0;
            d.circles.length = 0;
        }
        var circle = selector.append('circle').datum(d.points.length)
                .attr('cx', p[0]).attr('cy', p[1])
                .attr('r', 5)
                .attr('fill', 'black')
                .attr('fill-opacity', 0.5)
                .on('mouseover', function(d){
                    d3.select(this).transition().attr('r', 6).attr('fill', 'red');
                }).on('mouseout', function(d){
                    d3.select(this).transition().attr('r', 5).attr('fill', 'black');
                });
        if (d.circles.length){
            // if circle is not the first point, click is undo behaviour
            // pop until this point (i store point's current position)
            circle.on('click', function(i){
                d3.event.stopPropagation();
                while(i<d.points.length){
                    var end_circle = d.circles.pop();
                    var end_line = d.lines.pop();
                    var end_points = d.points.pop();
                    end_circle.remove();
                    end_line.remove();
                }
            });
        }else{
            // circle is the first point, click is close circle behaviour
            // delete all the circles and lines and create a polygon
            circle.on('click', function(i){
                d3.event.stopPropagation();
                while(d.circles.length){
                    var circle = d.circles.pop();
                    var line = d.lines.pop();
                    circle.remove();
                    line.remove();
                }
                d.closed = true;
                selector.append('polygon').classed('select', true)
                        .attr('points', d.points.map(function(p){return p[0]+','+p[1]}).join(' '))
                        .attr('fill', 'white').attr('fill-opacity', 0.3)
                        .attr('stroke', 'black').attr('stroke-width', 1);
            });

        }
        // an caveat, if line is not prepend to the front, it will block click envents for circles.
        var line = selector.insert('line', ':first-child').datum(d.points.length)
                .attr('stroke', 'black').attr('stroke-width', 2)
                .attr('fill-opacity', 0.5)
                .attr('x1', p[0]).attr('y1', p[1])
                .attr('x2', p[0]).attr('y2', p[1]);
        d.circles.push(circle);
        d.lines.push(line);
        d.points.push(p);
    }).on('mousemove', function(){
        // The last line will tracking mouse position
        if(!d.closed){
            const p = d3.mouse(this);
            const line = d.lines[d.lines.length-1];
            line.attr('x2', p[0]).attr('y2', p[1]);
        } 
    })
}

RegionSelection.prototype.clear_selected = function(){
    if (this.selector){
        this.area.on('.select', null);
        this.selector.remove();
        this.selector = undefined;
    }
}

// it will clear the selector from the screen and return the value
// if there is no selection available, return undefiened,
// else return the the data as described for each individual selection
RegionSelection.prototype.get_selected = function(){
    if (this.selector){
        const result = this.selector.datum();
    }else{
        return undefined;
    }
}
