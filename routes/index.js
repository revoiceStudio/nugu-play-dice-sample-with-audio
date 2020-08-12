const express = require('express');
const nugu = require('../nugu');
const router = express.Router();

router.post(`/nugu/ThrowDiceAction`, nugu);
router.post(`/nugu/ThrowYesAction`, nugu);
router.post(`/nugu/ThrowFinishedDiceAction`, nugu);

module.exports = router;
