const Router = require('koa-router');
const { Launch } = require('../../../models');
const { auth, authz, cache } = require('../../../middleware');
const transformResponse = require('./_transform-response');
const transformQuery = require('./_transform-query');

const router = new Router({
  prefix: '/v4/launches',
});

//
// Convenience Endpoints
//

// Get past launches
router.get('/past', cache(20), async (ctx) => {
  try {
    const result = await Launch.find({
      upcoming: false,
    }, null, {
      sort: {
        flight_number: 'asc',
      },
    });
    ctx.status = 200;
    ctx.body = await transformResponse(result);
  } catch (error) {
    ctx.throw(400, error.message);
  }
});

// Get upcoming launches
router.get('/upcoming', cache(20), async (ctx) => {
  try {
    const result = await Launch.find({
      upcoming: true,
    }, null, {
      sort: {
        flight_number: 'asc',
      },
    });
    ctx.status = 200;
    ctx.body = await transformResponse(result);
  } catch (error) {
    ctx.throw(400, error.message);
  }
});

// Get latest launch
router.get('/latest', cache(20), async (ctx) => {
  try {
    const result = await Launch.findOne({
      upcoming: false,
    }, null, {
      sort: {
        flight_number: 'desc',
      },
    });
    ctx.status = 200;
    ctx.body = await transformResponse(result);
  } catch (error) {
    ctx.throw(400, error.message);
  }
});

// Get next launch
router.get('/next', cache(20), async (ctx) => {
  try {
    const result = await Launch.findOne({
      upcoming: true,
    }, null, {
      sort: {
        flight_number: 'asc',
      },
    });
    ctx.status = 200;
    ctx.body = await transformResponse(result);
  } catch (error) {
    ctx.throw(400, error.message);
  }
});

//
// Standard Endpoints
//

// Get all launches
router.get('/', cache(20), async (ctx) => {
  try {
    const result = await Launch.find({});
    ctx.status = 200;
    ctx.body = await transformResponse(result);
  } catch (error) {
    ctx.throw(400, error.message);
  }
});

// Get one launch
router.get('/:id', cache(20), async (ctx) => {
  const result = await Launch.findById(ctx.params.id);
  if (!result) {
    ctx.throw(404);
  }
  ctx.status = 200;
  ctx.body = await transformResponse(result);
});

// Query launches
router.post('/query', cache(20), async (ctx) => {
  const { query = {}, options = {} } = await transformQuery(ctx.request.body);
  try {
    const result = await Launch.paginate(query, options);
    ctx.status = 200;
    ctx.body = await transformResponse(result);
  } catch (error) {
    ctx.throw(400, error.message);
  }
});

// Create a launch
router.post('/', auth, authz('launch:create'), async (ctx) => {
  try {
    const launch = new Launch(ctx.request.body);
    await launch.save();
    ctx.status = 201;
  } catch (error) {
    ctx.throw(400, error.message);
  }
});

// Update a launch
router.patch('/:id', auth, authz('launch:update'), async (ctx) => {
  try {
    await Launch.findByIdAndUpdate(ctx.params.id, ctx.request.body, {
      runValidators: true,
    });
    ctx.status = 200;
  } catch (error) {
    ctx.throw(400, error.message);
  }
});

// Delete a launch
router.delete('/:id', auth, authz('launch:delete'), async (ctx) => {
  try {
    await Launch.findByIdAndDelete(ctx.params.id);
    ctx.status = 200;
  } catch (error) {
    ctx.throw(400, error.message);
  }
});

module.exports = router;
