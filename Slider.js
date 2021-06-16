class Slider {

    constructor({ DOMselector, sliders }) {
        this.DOMselector = DOMselector;

        this.container = document.querySelector(this.DOMselector);

        this.width = 350;
        this.height = 350;

        this.centerX = this.width / 2;
        this.centerY = this.height / 2;

        this.tau = 2 * Math.PI;

        this.sliders = sliders;

        this.fractionThicknessArc = 20;
        this.fractionLengthArc = 7.5;
        this.fractionSpacingArc = 0.5;

        this.fractionBgColorArc = '#666';

        this.spotFillColor = '#FFF';
        this.spotBorderColor = '#454545'
        this.spotBorderThickness = '2';

        this.mouseDown = false;
        this.activeSlider = null;
    }
}