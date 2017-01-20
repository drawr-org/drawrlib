import {DrawrClient} from './../index.js';

describe.skip('DrawrClient', function() {
    let client;

    it('should create server instance', function() {
        client = new DrawrClient({
            name: 'pedro',
        }, {
            host: 'etsag.de',
            port: '8881'
        });
        expect(client).to.be.an.instanceOf(DrawrClient);
    });

    it('should create new session', function(done) {
        client.newSession('test session').then(() => {
            done();
        });
    });

    it('should return session id', function() {
        let id = client.getSessionId();
        expect(id).to.be.a('string');
    });

    it('should join session', function(done) {
        let id = client.getSessionId();
        if (!id) {
            console.log('couldn\'t join because creation failed');
            done();
        }
        let client2 = new DrawrClient({
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
