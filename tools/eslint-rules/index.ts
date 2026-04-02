import {
  linesBetweenTypeMembersRuleName,
  linesBetweenTypeMembersRule,
} from './rules/lines-between-type-members';
import {
  fieldsBeforeCallbacksRuleName,
  fieldsBeforeCallbacksRule,
} from './rules/fields-before-callbacks';
import {
  constantNamingRuleName,
  constantNamingRule,
} from './rules/constant-naming';

module.exports = {
  rules: {
    [linesBetweenTypeMembersRuleName]: linesBetweenTypeMembersRule,
    [fieldsBeforeCallbacksRuleName]: fieldsBeforeCallbacksRule,
    [constantNamingRuleName]: constantNamingRule,
  },
};
