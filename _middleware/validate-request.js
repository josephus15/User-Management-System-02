module.exports = validateRequest;

function validateRequest(req, next, schema) {
    const option = {
        abortEarly: false, // include all errors
        allUnknown: true, // ignore unknown props
        stripUnknown: true // remover unknown props
    };
    const { error, value} = schema.validate(req, body, options);
    if(error) {
        next(`Validation error: ${error.details.map(x => x.message).join(', ')}`);
    } else {
        req.body = value;
        next();
    }
}
