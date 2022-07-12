const formidable = require('formidable');
const firebase = require('../../resource/firebase')
const {getDB} = require('../../db/index')
const db = getDB;
const { v4: uuidv4 } = require('uuid');
const { sendMail } = require('../../resource/general');

const getMarriageRegStatus = async (req, res)=>{
    // check if marriage entry exist, if not, then return marriage entry not entered
    // if it exist, check if it's completely filled

    try {
        const user_id = (await req.user).u_id;

        const marriage = (await db.promise().query("SELECT * FROM marriage WHERE u_id = ?", [user_id]))[0]

        let msg = '';

        if(marriage.length > 0){
            const _marriage =marriage[0];

            if(_marriage.m_status == 1){
                msg = 'marriage entry filled';
            }else{
                msg = 'marriage entry not fully filled, fill again';
            }

            return res.status(200).json({
                status: true,
                message: msg,
                data: _marriage,
            })
        }else{
            msg = 'marriage entry not filled yet'

            return res.status(200).json({
                status: false,
                message: msg
            })
        }
    } catch (e) {
        console.log(e)
        return res.status(200).json({
            status: false,
            message: 'An error occurred',
            data: e,
        })
    }
}

const fillForm = async (req, res)=>{
    // check if marriage entry exist, if not, then return marriage entry not entered
    // if it exist, check if it's completely filled

    try {
        const user_id = (await req.user).u_id;

        const {
            is_anonymous,
            marital_status,
            pm_country,
            pm_state,
            dob,
            has_kids,
            kids,
            want_kids,
            accept_other_kids,
            could_adopt,
            family_type,
            family_size,
            accomodate_other_family,
            raised_by,
            partner_contribution_preference,
            salary_range,
            partner_height,
            domestic_work,
            health_condition,
            blood_group,
            genotype
        } = req.body

        const marriage = (await db.promise().query("SELECT * FROM marriage WHERE u_id = ?", [user_id]))[0]

        let msg = '';

        if(marriage.length > 0){
            // check if data is already created, if so, update it

            let sql = "UPDATE marriage SET is_anonymous = ?, marital_status = ?, pm_country = ?, pm_state = ?, dob = ?, has_kids = ?, kids = ?, want_kids = ?, accept_other_kids = ?, could_adopt = ?, family_type = ?, family_size = ?, accomodate_other_family = ?, raised_by = ?, partner_contribution_preference = ?, salary_range = ?, partner_height = ?, domestic_work = ?, health_condition = ?, blood_group = ?, genotype = ? WHERE u_id = ?";
            const result = (await db.promise().query(sql, [is_anonymous, marital_status, pm_country, pm_state, dob, has_kids, kids, want_kids, accept_other_kids, could_adopt, family_type, family_size, accomodate_other_family, raised_by, partner_contribution_preference, salary_range, partner_height, domestic_work, health_condition, blood_group, genotype, user_id]))[0];

            if(result.affectedRows == 1){
                return res.status(200).json({
                    status: true,
                    message: 'Form filled successfully',
                })
            }else{
                return res.status(200).json({
                    status: false,
                    message: 'An error occurred'
                })
            }
        }else{
            // create data

            // affectedRows = 0 if already exist, 1 if not exist

            let sql = "INSERT INTO `marriage` (`u_id`, `is_anonymous`, `marital_status`, `pm_country`, `pm_state`, `dob`, `has_kids`, `kids`, `want_kids`, `accept_other_kids`, `could_adopt`, `family_type`, `family_size`, `accomodate_other_family`, `raised_by`, `partner_contribution_preference`, `salary_range`, `partner_height`, `domestic_work`, `health_condition`, `blood_group`, `genotype`, `status`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            let params = [user_id, is_anonymous, marital_status, pm_country, pm_state, dob, has_kids, kids, want_kids, accept_other_kids, could_adopt, family_type, family_size, accomodate_other_family, raised_by, partner_contribution_preference, salary_range, partner_height, domestic_work, health_condition, blood_group, genotype, 1];
            const result = (await db.promise().query(sql, params))[0];

            if(result.affectedRows == 1){
                return res.status(200).json({
                    status: true,
                    message: 'Form filled successfully',
                })
            }else{
                return res.status(200).json({
                    status: false,
                    message: 'An error occurred'
                })
            }
        }
    } catch (e) {
        console.log(e)
        return res.status(200).json({
            status: false,
            message: 'An error occurred',
            data: e,
        })
    }
}

module.exports = {
    getMarriageRegStatus,
    fillForm
}