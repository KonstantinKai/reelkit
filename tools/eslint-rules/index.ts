import {
  kLinesBetweenTypeMembersRuleName,
  linesBetweenTypeMembersRule,
} from './rules/lines-between-type-members';
import {
  kFieldsBeforeCallbacksRuleName,
  fieldsBeforeCallbacksRule,
} from './rules/fields-before-callbacks';
import {
  kConstantNamingRuleName,
  constantNamingRule,
} from './rules/constant-naming';

module.exports = {
  rules: {
    [kLinesBetweenTypeMembersRuleName]: linesBetweenTypeMembersRule,
    [kFieldsBeforeCallbacksRuleName]: fieldsBeforeCallbacksRule,
    [kConstantNamingRuleName]: constantNamingRule,
  },
};
