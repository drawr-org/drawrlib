describe.only('ServerConnection', function() {
    let Drawr = require('./../index.js');
    let client;

    it('should create server instance', function() {
        client = new Drawr.ServerConnection({
            name: 'pedro',
        }, {
            host: 'etsag.de',
            port: '8881'
        });
        expect(client).to.be.an.instanceOf(Drawr.ServerConnection);
    });

    it('should create new session', function(done) {
        client.newSession('test session').then(data => {
            expect(data.sessionId).to.be.an.instanceOf(String);
            done();
        });
    });

    it('should join session', function(done) {
        let id = client.getSessionId();
        if (!id) {
            console.log('couldn\'t join because creation failed');
            done();
        }
        let client2 = new Drawr.ServerConnection({
            name: 'lukas',
        }, {
            host: 'etsag.de',
            port: '8881'
        });
        client2.joinSession(id).then(() => {
            // expect()
            done();
        });
    });

});
