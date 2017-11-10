<?php

namespace app\modules\admin\models;

/**
 * This is the ActiveQuery class for [[AccountsUserGroupsEntry]].
 *
 * @see AccountsUserGroupsEntry
 */
class AccountsUserGroupsEntryQuery extends \yii\db\ActiveQuery
{
    /*public function active()
    {
        return $this->andWhere('[[status]]=1');
    }*/

    /**
     * @inheritdoc
     * @return AccountsUserGroupsEntry[]|array
     */
    public function all($db = null)
    {
        return parent::all($db);
    }

    /**
     * @inheritdoc
     * @return AccountsUserGroupsEntry|array|null
     */
    public function one($db = null)
    {
        return parent::one($db);
    }
}
