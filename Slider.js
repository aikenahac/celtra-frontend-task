// TODO: Create methods for displaying slider names and values in text

class Slider {

    constructor({DOMselector, sliders}) {
        this.DOMselector = DOMselector;

        this.container = document.querySelector(this.DOMselector);

        this.width = 350;
        this.height = 350;

        this.centerX = this.width / 2;
        this.centerY = this.height / 2;

        this.tau = 2 * Math.PI;

        this.sliders = sliders;

        this.fractionThicknessArc = 25;
        this.fractionLengthArc = 10;
        this.fractionSpacingArc = 0.85;

        this.fractionBgColorArc = '#999';

        this.spotFillColor = '#FFF';
        this.spotBorderColor = '#454545'
        this.spotBorderThickness = '3';

        this.mouseDown = false;
        this.activeSlider = null;
    }

    draw() {

        const containerSVG = document.createElement('div');

        containerSVG.classList.add('sliders');

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

        svg.setAttribute('height', this.height);
        svg.setAttribute('width', this.width);

        containerSVG.appendChild(svg);
        this.container.appendChild(containerSVG);

        this.sliders.forEach((slider, index) => this.singleSliderDraw(svg, slider, index));

        containerSVG.addEventListener('mousedown', this.mtStart.bind(this), false);
        containerSVG.addEventListener('mousemove', this.mtMove.bind(this), false);

        containerSVG.addEventListener('touchstart', this.mtStart.bind(this), false);
        containerSVG.addEventListener('touchmove', this.mtMove.bind(this), false);

        window.addEventListener('mouseup', this.mtEnd.bind(this), false);
        window.addEventListener('touchend', this.mtEnd.bind(this), false);
    }

    singleSliderDraw(svg, slider, index) {

        const circumference = slider.radius * this.tau;

        const initialAngle = Math.floor((slider.initialValue / (slider.max - slider.min)) * 360);

        const arcFractionSpacing = this.arcFractionsSpacingCalc(
            circumference,
            this.fractionLengthArc,
            this.fractionSpacingArc
        );

        const groupedSliders = document.createElementNS('http://www.w3.org/2000/svg', 'g');

        groupedSliders.setAttribute('class', 'singleSlider');
        groupedSliders.setAttribute('data-slider', index);
        groupedSliders.setAttribute('transform', `rotate(-90,${this.centerX},${this.centerY})`);
        groupedSliders.setAttribute('rad', slider.radius);

        svg.appendChild(groupedSliders);

        this.arcPathDraw(
            this.fractionBgColorArc,
            slider.radius,
            360,
            arcFractionSpacing,
            'bg',
            groupedSliders
        );

        this.arcPathDraw(
            slider.color,
            slider.radius,
            initialAngle,
            arcFractionSpacing,
            'active',
            groupedSliders
        );

        this.drawSpot(slider, initialAngle, groupedSliders);
    }

    drawSpot(slider, initialAngle, group) {
        const spotCenter = this.spotCenterCalc(initialAngle * this.tau / 360, slider.radius);

        const spotSVG = document.createElementNS('http://www.w3.org/2000/svg', 'circle');

        spotSVG.setAttribute('class', 'spotSlider');
        spotSVG.setAttribute('cx', spotCenter.x);
        spotSVG.setAttribute('cy', spotCenter.y);
        spotSVG.setAttribute('r', `${this.fractionThicknessArc / 2}`);

        spotSVG.style.stroke = this.spotBorderColor;
        spotSVG.style.strokeWidth = this.spotBorderThickness;
        spotSVG.style.fill = this.spotFillColor;

        group.appendChild(spotSVG);
    }

    arcPathDraw(color, radius, angle, spacing, type, group) {
        const classPath = (type === 'active') ? 'singleSliderPathActive' : 'singleSliderPath';

        const pathSVG = document.createElementNS('http://www.w3.org/2000/svg', 'path');

        pathSVG.classList.add(classPath);

        pathSVG.setAttribute('d', this.arcDescribe(this.centerX, this.centerY, radius, 0, angle));

        pathSVG.style.stroke = color;
        pathSVG.style.strokeWidth = this.fractionThicknessArc;
        pathSVG.style.fill = 'none';

        pathSVG.setAttribute('stroke-dasharray', this.fractionLengthArc + ' ' + spacing);

        group.appendChild(pathSVG);
    }

    activeSliderRedraw(rmtc) {
        const activePath = this.activeSlider.querySelector('.singleSliderPathActive');
        const radius = this.activeSlider.getAttribute('rad');
        const currentAngle = this.mouseAngleCalc(rmtc);

        activePath.setAttribute(
            'd',
            this.arcDescribe(this.centerX, this.centerY, radius, 0, this.radToDeg(currentAngle))
        );

        const spot = this.activeSlider.querySelector('.spotSlider');
        const spotCenter = this.spotCenterCalc(currentAngle, radius);

        spot.setAttribute('cx', spotCenter.x);
        spot.setAttribute('cy', spotCenter.y);
    }

    // Helper functions

    polToCart(cx, cy, radius, degreesAngle) {
        const radiansAngle = degreesAngle * Math.PI / 180;

        const x = cx + (radius * Math.cos(radiansAngle));
        const y = cy + (radius * Math.sin(radiansAngle));

        return {x, y};
    }

    arcDescribe(x, y, radius, angleStart, angleEnd) {
        let path;
        let angleEndOrigin = angleEnd;
        let start;
        let end;
        let arcSweep;

        if (angleEndOrigin - angleStart === 360) angleEnd = 359;

        start = this.polToCart(x, y, radius, angleEnd);
        end = this.polToCart(x, y, radius, angleStart);

        arcSweep = angleEnd - angleStart <= 180 ? '0' : '1';

        path = [
            'M', start.x, start.y,
            'A', radius, radius, 0, arcSweep, 0, end.x, end.y
        ];

        if (angleEndOrigin - angleStart === 360) path.push('z');

        return path.join(' ');
    }

    spotCenterCalc(angle, radius) {
        const x = this.centerX + Math.cos(angle) * radius;
        const y = this.centerY + Math.sin(angle) * radius;

        return {x, y}
    }

    mouseAngleCalc(rmtc) {
        const angle = Math.atan2(rmtc.y - this.centerY, rmtc.x - this.centerX);

        if (angle > - this.tau / 2 && angle < - this.tau / 4) return angle + this.tau * 1.25;
        else return angle + this.tau * 0.25;
    }

    radToDeg(angle) {
        return angle / (Math.PI / 180);
    }

    locateClosestSlider(rmtc) {
        const fromCenter = Math.hypot(rmtc.x - this.centerX, rmtc.y - this.centerY);
        const slidersContainer = document.querySelector('.sliders');
        const groupedSliders = Array.from(slidersContainer.querySelectorAll('g'));

        const distances = groupedSliders.map(slider => {
            const rad = parseInt(slider.getAttribute('rad'));

            return Math.min(Math.abs(fromCenter - rad));
        });

        const closestSlider = distances.indexOf(Math.min(...distances));
        this.activeSlider = groupedSliders[closestSlider];
    }

    relativeMouseTouchCoord(e) {
        const container = document.querySelector('.sliders').getBoundingClientRect();

        let x;
        let y;
        let posX;
        let posY;

        if (window.TouchEvent && e instanceof TouchEvent) {
            posX = e.touches[0].pageX;
            posY = e.touches[0].pageY;
        } else {
            posX = e.clientX;
            posY = e.clientY;
        }

        x = posX - container.left;
        y = posY - container.top;

        return {x, y};
    }

    arcFractionsSpacingCalc(circumference, fractionLengthArc, fractionBetweenSpacingArc) {

        const fractions = Math.floor((circumference / fractionLengthArc) * fractionBetweenSpacingArc);
        const spacingTotal = circumference - fractions * fractionLengthArc;

        return spacingTotal / fractions;
    }

    // Mouse/touch event functions

    mtStart(e) {
        console.log('mt start')
        if (this.mouseDown) return;

        this.mouseDown = true;

        const rmtc = this.relativeMouseTouchCoord(e);

        this.locateClosestSlider(rmtc);
        this.activeSliderRedraw(rmtc);
    }

    mtMove(e) {
        console.log('mt move')
        if (!this.mouseDown) return;

        e.preventDefault();

        const rmtc = this.relativeMouseTouchCoord(e);
        this.activeSliderRedraw(rmtc);
    }

    mtEnd() {
        console.log('mt end')
        if (!this.mouseDown) return;

        this.mouseDown = false;
        this.activeSlider = null;
    }

}