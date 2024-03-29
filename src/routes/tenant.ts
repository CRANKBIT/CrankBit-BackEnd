import { Router } from 'express'
import { register, login, getTenantById, updateTenant, checkLogin } from '../controllers/private/tenant'

const tenantRouter = Router()

/**
 * @openapi
 * '/api/v1/auth/register':
 *  post:
 *    summary: Register new user
 *    tags: [Auth]
 *    requestBody:
 *      description: User registration data
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - name
 *              - email
 *              - password
 *            properties:
 *              name:
 *                type: string
 *              email:
 *                type: string
 *              password:
 *                type: string
 *    responses:
 *      201:
 *        description: Successful registration
 *      400:
 *        description: Invalid registration data
 */
tenantRouter.route('/register').post(register)

/**
 * @openapi
 * '/api/v1/auth/login':
 *  post:
 *    summary: Login user
 *    tags: [Auth]
 *    requestBody:
 *      description: User login data
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - email
 *              - password
 *            properties:
 *              email:
 *                type: string
 *              password:
 *                type: string
 *    responses:
 *      200:
 *        description: Successful login
 *      400:
 *        description: Bad login data
 *      401:
 *        description: Invalid credentials
 */
tenantRouter.route('/login').post(login)

tenantRouter.route('/:id').get(getTenantById).patch(updateTenant)
tenantRouter.route('/check-login').get(checkLogin)

export default tenantRouter
