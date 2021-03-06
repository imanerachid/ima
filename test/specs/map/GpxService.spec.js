/* eslint-disable max-len */
describe('ga_gpx_service', function() {

  describe('gaGpx', function() {
    var gaGpx, $rootScope, gaStyleFactory;

    beforeEach(function() {
      inject(function($injector) {
        $rootScope = $injector.get('$rootScope');
        gaGpx = $injector.get('gaGpx');
        gaStyleFactory = $injector.get('gaStyleFactory');
      });
    });

    describe('#getType()', function() {
      it('returns a string', function() {
        expect(gaGpx.getType()).to.be('GPX');
      });
    });

    describe('#getFormat()', function() {

      it('returns an ol.format.GPX object', function() {
        var spy = sinon.spy(ol.format, 'GPX');
        var f = gaGpx.getFormat();
        expect(f).to.be.a(ol.format.GPX);
        expect(spy.calledOnce).to.be(true);
        expect(spy.args[0][0].readExtensions).to.be(false);
        spy.restore();
      });

      it('returns the same object on 2nd call', function() {
        var spy = sinon.spy(ol.format, 'GPX');
        var f = gaGpx.getFormat();
        f = gaGpx.getFormat();
        expect(f).to.be.a(ol.format.GPX);
        expect(spy.calledOnce).to.be(true);
        expect(spy.args[0][0].readExtensions).to.be(false);
        spy.restore();
      });
    });

    describe('#getStyle()', function() {

      it('returns an ol.style.Style object', function() {
        var spy = sinon.spy(gaStyleFactory, 'getStyle');
        var f = gaGpx.getStyle();
        expect(f).to.be.a(ol.style.Style);
        expect(spy.calledOnce).to.be(true);
        expect(spy.args[0][0]).to.be('gpx');
        spy.restore();
      });

      it('returns the same object on 2nd call', function() {
        var spy = sinon.spy(gaStyleFactory, 'getStyle');
        var f = gaGpx.getStyle();
        f = gaGpx.getStyle();
        expect(f).to.be.a(ol.style.Style);
        expect(spy.calledOnce).to.be(true);
        expect(spy.args[0][0]).to.be('gpx');
        spy.restore();
      });

      it('makes sure the text style is not defined (breaks ol-cesium synchronizer if there is not text to display with this text style)', function() {
        var spy = sinon.spy(gaStyleFactory, 'getStyle');
        var f = gaGpx.getStyle();
        expect(spy.calledOnce).to.be(true);
        expect(f.getText()).to.be(null);
      });
    });

    describe('#sanitize()', function() {

      it('returns the same object passed in parameter', function() {
        var a = 'lala';
        var f = gaGpx.sanitize(a);
        expect(f).to.be(a);
      });
    });

    describe('#sanitizeFeature()', function() {

      it('set the default style to the feature', function() {
        var f = new ol.Feature();
        expect(f.getStyleFunction()).to.be(undefined);
        f = gaGpx.sanitizeFeature(f);
        expect(f.getStyleFunction()()[0]).to.be(gaGpx.getStyle());
      });

      it('removes the time coordinate', function() {
        var f = new ol.Feature(new ol.geom.Point([0, 0, 123], 'XYM'));
        expect(f.getGeometry().getLayout()).to.eql('XYM');
        expect(f.getGeometry().getCoordinates()).to.eql([0, 0, 123]);
        f = gaGpx.sanitizeFeature(f);
        expect(f.getGeometry().getLayout()).to.eql('XY');
        expect(f.getGeometry().getCoordinates()).to.eql([0, 0]);
      });

      it('set altitudeMode to relativeToGround', function() {
        [
          'XY',
          'XYM'
        ].forEach(function(layout) {
          var f = new ol.Feature(new ol.geom.Point([0, 0, 123], layout));
          f = gaGpx.sanitizeFeature(f);
          expect(f.getGeometry().get('altitudeMode')).to.be(undefined);
        });
        [
          'XYZ',
          'XYZM'
        ].forEach(function(layout) {
          var f = new ol.Feature(new ol.geom.Point([0, 0, 123], layout));
          f = gaGpx.sanitizeFeature(f);
          expect(f.getGeometry().get('altitudeMode')).to.be('relativeToGround');
        });
      });
    });

    describe('#getName()', function() {

      it('get the name to display in layer manager', function() {
        var gpx = '<?xml version="1.0" encoding="ISO-8859-1" standalone="yes"?><gpx> ' +
          ' <metadata> ' +
          '   <name><![CDATA[Gpx Name]]></name>' +
          '   <desc><![CDATA[Alps Epic Trail Davos]]></desc>' +
          ' </metadata> ' +
          ' <wpt lat="46.710596" lon="9.773448"><name>Davos Monstein</name><sym>Scenic Area</sym></wpt>' +
          '</gpx>';
        expect(gaGpx.getName(gpx)).to.be('Gpx Name');
      });

      it('returns undefined if no name in the doc', function() {
        var gpx = '<?xml version="1.0" encoding="ISO-8859-1" standalone="yes"?><gpx> ' +
          ' <wpt lat="46.710596" lon="9.773448"><name>Davos Monstein</name><sym>Scenic Area</sym></wpt>' +
          '</gpx>';
        expect(gaGpx.getName(gpx)).to.be(undefined);
      });
    });

    describe('#getLinkedData()', function() {

      it('returns a promise', function(done) {
        gaGpx.getLinkedData().then(function(response) {
          expect(response).to.be.an('array');
          expect(response.length).to.be(0);
          done();
        });
        $rootScope.$digest();
      });
    });
  });
});
