
Parse.Cloud.define("AfterSignup", function(request, response) {
    try {
        var userId = request.params.userId;
        let userQuery = new Parse.Query(Parse.User);
        userQuery.equalTo('objectId', userId);
        userQuery.first({useMasterKey: true})
        .then(user => {
            if (user) {
                var contactQuery = new Parse.Query('Contact');
                contactQuery.equalTo('phoneNbr', user.get('phoneNbr'));
                contactQuery.doesNotExist('user');
                contactQuery.limit(1000);
                contactQuery.find({useMasterKey: true})
                .then((contacts) => {
                    if (!contacts.length) {
                        response.success();
                        return;
                    }
                    contacts.forEach(c => {
                        c.set('user', user.toPointer());
                    });
                    Parse.Object.saveAll(contacts, {useMasterKey: true})
                    .then(() => {
                        var promises = [];
                        contacts.forEach(c => {
                            var owner = c.get('withUser');
                            var pushQuery = new Parse.Query(Parse.Installation);
                            pushQuery.equalTo('userId', owner.id);
                            pushQuery.notEqualTo("pushActivated", false);
                            var promise = Parse.Push.send({
                                where: pushQuery,
                                data: {
                                    alert: `${c.get('name')} is now on Fonetact!`,
                                    badge: 0,
                                    sounds: 'default',
                                    senderId: user.id,
                                    contactId: c.id,
                                    type: 'new contact'
                                }
                            }, {
                                useMasterKey: true,
                                success: () => {}
                            });
                            promises.push(promise);
                        });
                        Parse.Promise.when(promises).then(() => {
                            response.success();
                        }, function(error) {
                            response.error('failed to send push ' + error.message);
                        });
                    }, (error) => {
                        response.error('save all failed ' + error.message);
                    });
                }, (error) => {
                    response.error('contact find failed ' + error.message);
                });
            }
        }, error => {
            response.error(error.message);
        });
        
    } catch (er) {
        response.error(er);
    }
});
