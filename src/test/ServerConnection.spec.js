describe('ServerConnection', function() {
    let Drawr = require('./../index.js');
    let server;

    it('should connect to server', function(done) {
        server = new Drawr.ServerConnection({
            name: 'pedro'
        });
        server.eventEmitter.on('connect', done);
    });

    it('should create new session', function(done) {
        server.newSession('test session', (data) => {
            expect(data.sessionId).to.be.an.instanceOf(String);
            done();
        });
    });
});
