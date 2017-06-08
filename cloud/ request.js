
function SendRequestPushNotification(request, sender, receiver, status, alert) {
    var pushQuery = new Parse.Query(Parse.Installation);
    var to;
    if (status === 'pending') {
        to = receiver.id;
    } else if (status === 'accepted') {
        to = sender.id;
    }
    pushQuery.equalTo('userId', to);
    pushQuery.notEqualTo('pushActivated', false);
    return Parse.Push.send({
        where: pushQuery,
        data: {
            alert: alert,
            badge: 0,
            sounds: 'default',
            senderId: status === 'pending' ? sender.id : receiver.id,
            receiverId: status === 'pending' ? receiver.id : sender.id,
            requestId: request.id
        }
    }, {
        useMasterKey: true
    });
}
function GetPushNotificationAlert(request, sender, receiver, status, type) {
    var promise = new Parse.Promise();
    if (status === 'pending') {
        if (type === 'requestPhonebookPhoneNumber') {
            var requestedContact = request.get('contact');
            requestedContact.fetch({
                useMasterKey: true
            }).then(reqContact => {
                let contactQuery = new Parse.Query('Contact');
                contactQuery.equalTo('user', sender.toPointer());
                contactQuery.equalTo('withUser', receiver.toPointer());
                contactQuery.first({
                    useMasterKey: true
                }).then(contact => {
                    if (contact) {
                        promise.resolve(contact.get('name') + " is asking for " + reqContact.get('name') +"'s phone number");
                    } else {
                        promise.resolve(sender.get('name') + " is asking for " + reqContact.get('name') + "'s phone number");
                    }
                }, error => {
                    promise.reject(error.message);
                });
            }, error => {
                promise.reject(error.message);
            });
        } else if (type === 'requestPhonebook') {
            let contactQuery = new Parse.Query('Contact');
            contactQuery.equalTo('user', sender.toPointer());
            contactQuery.equalTo('withUser', receiver.toPointer());
            contactQuery.first({
                useMasterKey: true
            }).then(contact => {
                if (contact) {
                    promise.resolve(contact.get('name') + " wants to access your phone book");
                } else {
                    promise.resolve(sender.get('name') + " wants to access your phone book");
                }
            }, error => {
                promise.reject(error.message);
            });
        } else if (type === 'requestPhoneNumber') {
            promise.resolve(sender.get('name') + " is asking for your phone number");
        }
    } else if (status === 'accepted') {
        if (type === 'requestPhonebook') {
            let contactQuery = new Parse.Query('Contact');
            contactQuery.equalTo('user', receiver.toPointer());
            contactQuery.equalTo('withUser', sender.toPointer());
            contactQuery.first({
                useMasterKey: true
            }).then(contact => {
                if (contact) {
                    contact.set('phoneBookPermission', 'accepted');
                    contact.save(null, {
                        useMasterKey: true
                    }).then(() => {
                        promise.resolve(contact.get('name') + " gave you access to his phone book");
                    }, error => {
                        promise.reject(error.message);
                    });
                } else {
                    promise.resolve(receiver.get('name') + " gave you access to his phone book");
                }
            }, error => {
                promise.reject(error.message);
            });
        } else if (type === 'requestPhonebookPhoneNumber') {
            let requestedContact = request.get('contact');
            requestedContact.fetch({
                useMasterKey: true
            }).then((requestedContact) => {
                let contactQuery = new Parse.Query('Contact');
                contactQuery.equalTo('user', receiver.toPointer());
                contactQuery.equalTo('withUser', sender.toPointer());
                contactQuery.first({
                    useMasterKey: true
                }).then(contact => {
                    if (contact) {
                        promise.resolve(contact.get('name') + " accepted to give you " + requestedContact.get('name') + "'s phone number");
                    } else {
                        promise.resolve(receiver.get('name') + " accepted to give you " + requestedContact.get('name') + "'s phone number");
                    }
                }, error => {
                    promise.reject(error.message);
                });
            }, error => {
                promise.reject(error.message);
            });
        } else {
            promise.resolve(receiver.get('name') + " accepted to give you his phone number");
        }
    }
    return promise;
}
Parse.Cloud.define("AfterSaveRequest", function(request, response) {
    try {
        var requestId = request.params.requestId;
        let requestQuery = new Parse.Query('Request');
        requestQuery.equalTo('objectId', requestId);
        requestQuery.include('sender');
        requestQuery.include('receiver');
        requestQuery.first({useMasterKey: true})
        .then(requestObj => {
            if (requestObj) {
                
                var sender = requestObj.get('sender');
                var receiver = requestObj.get('receiver');
                var status = requestObj.get('status');
                var type = requestObj.get('type');
                
                GetPushNotificationAlert(requestObj, sender, receiver, status, type)
                .then(alert => {
                    SendRequestPushNotification(requestObj, sender, receiver, status, alert)
                    .then(() => {
                        response.success();
                    },
                     error => {
                        response.error(error.message);
                     });
                }, error => {
                    response.error(error.message);
                });
                           
            }
        }, error => {
            response.error(error.message);
        });
    } catch (er) {
        response.error(er);
    }
});
Parse.Cloud.afterDelete('Request', function (req) {
    'use strict';
    var request = req.object;
    var sender = request.get('sender');
    var receiver = request.get('receiver');
    var type = request.get('type');
    if (type === 'requestPhonebook') {
        let contactQuery = new Parse.Query('Contact');
        contactQuery.equalTo('user', receiver.toPointer());
        contactQuery.equalTo('withUser', sender.toPointer());
        contactQuery.first({
            useMasterKey: true
        }).then(contact => {
            if (contact) {
                contact.unset('phoneBookPermission');
                contact.save(null, {useMasterKey: true});
            }
        }, error => {});
    }
});
