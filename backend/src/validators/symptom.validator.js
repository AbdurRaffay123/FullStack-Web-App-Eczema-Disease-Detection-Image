/**
 * Symptom Log Validation Schemas
 * Validates symptom log creation and update requests
 */

const validateCreateLog = (req, res, next) => {
  const { itchinessLevel, affectedArea, possibleTriggers, additionalNotes } = req.body;
  const errors = [];

  // Validate itchinessLevel
  if (itchinessLevel === undefined || itchinessLevel === null) {
    errors.push('Itchiness level is required');
  } else {
    const level = Number(itchinessLevel);
    if (isNaN(level)) {
      errors.push('Itchiness level must be a number');
    } else if (level < 1 || level > 10) {
      errors.push('Itchiness level must be between 1 and 10');
    }
  }

  // Validate affectedArea
  if (!affectedArea || typeof affectedArea !== 'string' || affectedArea.trim().length === 0) {
    errors.push('Affected area is required');
  } else if (affectedArea.trim().length > 200) {
    errors.push('Affected area cannot exceed 200 characters');
  }

  // Validate possibleTriggers (optional)
  if (possibleTriggers !== undefined && possibleTriggers !== null) {
    if (typeof possibleTriggers !== 'string') {
      errors.push('Possible triggers must be a string');
    } else if (possibleTriggers.length > 500) {
      errors.push('Possible triggers cannot exceed 500 characters');
    }
  }

  // Validate additionalNotes (optional)
  if (additionalNotes !== undefined && additionalNotes !== null) {
    if (typeof additionalNotes !== 'string') {
      errors.push('Additional notes must be a string');
    } else if (additionalNotes.length > 1000) {
      errors.push('Additional notes cannot exceed 1000 characters');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors.join(', '),
    });
  }

  next();
};

const validateUpdateLog = (req, res, next) => {
  const { itchinessLevel, affectedArea, possibleTriggers, additionalNotes } = req.body;
  const errors = [];

  // Validate itchinessLevel (optional for update)
  if (itchinessLevel !== undefined && itchinessLevel !== null) {
    const level = Number(itchinessLevel);
    if (isNaN(level)) {
      errors.push('Itchiness level must be a number');
    } else if (level < 1 || level > 10) {
      errors.push('Itchiness level must be between 1 and 10');
    }
  }

  // Validate affectedArea (optional for update)
  if (affectedArea !== undefined && affectedArea !== null) {
    if (typeof affectedArea !== 'string') {
      errors.push('Affected area must be a string');
    } else if (affectedArea.trim().length === 0) {
      errors.push('Affected area cannot be empty');
    } else if (affectedArea.trim().length > 200) {
      errors.push('Affected area cannot exceed 200 characters');
    }
  }

  // Validate possibleTriggers (optional)
  if (possibleTriggers !== undefined && possibleTriggers !== null) {
    if (typeof possibleTriggers !== 'string') {
      errors.push('Possible triggers must be a string');
    } else if (possibleTriggers.length > 500) {
      errors.push('Possible triggers cannot exceed 500 characters');
    }
  }

  // Validate additionalNotes (optional)
  if (additionalNotes !== undefined && additionalNotes !== null) {
    if (typeof additionalNotes !== 'string') {
      errors.push('Additional notes must be a string');
    } else if (additionalNotes.length > 1000) {
      errors.push('Additional notes cannot exceed 1000 characters');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors.join(', '),
    });
  }

  next();
};

module.exports = {
  validateCreateLog,
  validateUpdateLog,
};

