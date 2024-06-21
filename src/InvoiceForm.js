import React, { useState } from 'react';
import axios from 'axios';
import './index.css';

const InvoiceForm = () => {
    const [formData, setFormData] = useState({
        invoiceNumber: '',
        referenceNumber: '',
        invoiceDate: '',
        dueDate: '',
        deliveryDate: '',
        deliveryMethod: '',
        issuer: 'WebCodes OÜ',
        regNumber: '16809459',
        vatNumber: '',
        issuerContact: 'Lossi plats 1a, 10137 Tallinn, www.ettevote.ee, info@ettevote.ee',
        receiverAddress: '',
        additionalInfo: 'Tasumisel palume maksekorraldusele kindlasti märkida viitenumber',
        items: [{ description: '', unitPrice: 0, quantity: 0, vat: 0 }],
        totalExclVat: 0,
        totalVat: 0,
        totalInclVat: 0
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        const items = [...formData.items];
        items[index][name] = value;
        setFormData({ ...formData, items });
    };

    const removeItem = (index) => {
        const updatedItems = [...formData.items];
        updatedItems.splice(index, 1);
        setFormData({ ...formData, items: updatedItems });
    };

    const addItem = () => {
        setFormData({ ...formData, items: [...formData.items, { description: '', unitPrice: 0, quantity: 0, vat: 22 }] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Perform calculation for totals here
    
        try {
            const response = await axios.post('http://localhost:3003/create-pdf', formData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    
            if (response.status === 200) {
                window.open('http://localhost:3003/invoice.pdf');
            } else {
                console.error('Failed to create PDF');
            }
        } catch (error) {
            console.error('Error creating PDF:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="invoice-form">
            <h1>Arve</h1>
            <div className="form-group">
                <div className='form-body'>
                    <div className='form'>
                        <label>Arve number
                            <span className='has-text-danger'>*</span>
                        </label>
                        <input type="text" name="invoiceNumber" placeholder='120123456789' value={formData.invoiceNumber} onChange={handleInputChange} required />
                    </div>
                    <div className='form'>
                        <label>Viitenumber</label>
                        <input type="text" name="referenceNumber" placeholder='12345' value={formData.referenceNumber} onChange={handleInputChange} />
                    </div>
                </div>
            </div>
            <div className="form-group">
                <div className='form-body'>
                    <div className='form'>
                        <label>Arve kuupäev
                            <span className='has-text-danger'>*</span>
                        </label>
                        <input type="date" name="invoiceDate" value={formData.invoiceDate} onChange={handleInputChange} required />
                    </div>
                    <div className='form'>
                        <label>Maksähtäeg</label>
                        <input type="date" name="dueDate" value={formData.dueDate} onChange={handleInputChange} />
                        </div>
                    <div className='form'>
                        <label>Tarneähtäeg</label>
                        <input type="date" name="deliveryDate" value={formData.deliveryDate} onChange={handleInputChange} />
                    </div>
                </div>
            </div>
            <div className="form-group">
                <div className='form-body'>
                    <div className='form-'>
                        <label>Kättetoimetamise viis</label>
                        <input type="text" name="deliveryMethod" value={formData.deliveryMethod} onChange={handleInputChange} />
                    </div>
                </div>
            </div>
            <div className="form-group">
                <div className='form-body'>
                    <div className='form'>
                        <label>Arve esitaja</label>
                        <input type="text" name="issuer" value={formData.issuer} onChange={handleInputChange}/>
                </div>
                <div className='form'>
                    <label>Registreerimisnumber</label>
                    <input type="text" name="regNumber" value={formData.regNumber} onChange={handleInputChange}/>
                </div>
                <div className="form">
                    <label>KMKR</label>
                    <input type="text" placeholder='EE123456789' name="vatNumber" value={formData.vatNumber} onChange={handleInputChange}/>
                    </div>
                </div>
            </div>
            <div className="form-group">
                <div className='form-body'>
                    <div className='form'>
                        <label>Ettevõtte kontakt</label>
                        <textarea name="issuerContact" value={formData.issuerContact} onChange={handleInputChange}></textarea>
                    </div>
                </div>
            </div>
            <div className="form-group">
                <div className='form-body'>
                    <div className='form'>
                        <label>Arve saaja</label>
                        <textarea type="text" placeholder='Eesnimi Perenimi Valli kraavi 3-89 11078 Viljandi' name="receiverAddress" value={formData.receiverAddress} onChange={handleInputChange} />
                    </div>
                </div>
            </div>
            <div className="form-group">
                <div className='form-body'>
                    <div className='form'>
                        <label>Arve lisainfo</label>
                        <textarea name="additionalInfo" value={formData.additionalInfo} onChange={handleInputChange}></textarea>
                    </div>
                </div>
            </div>
                <label className='title'>Tooted ja teenused</label>
                {formData.items.map((item, index) => (
                    <div key={index} className="form-group">
                        <div className='form-body'>
                            <div className='form'>
                                <label>Nimetus</label>
                                <input type="text" name="description" placeholder="Nimi" value={item.description} onChange={(e) => handleItemChange(index, e)} />
                                <p  className='help'>Kirjeldus</p>
                            </div>
                            <div className='form'>
                            <label>Ühiku hind</label>  
                                <input type="number" name="unitPrice" value={item.unitPrice} onChange={(e) => handleItemChange(index, e)} />
                                <p  className='help'>Ühiku hind km-ta</p>
                            </div>
                            <div className='form'>
                            <label>Kogus</label>  
                                <input type="number" name="quantity" placeholder="1 tk" value={item.quantity} onChange={(e) => handleItemChange(index, e)} />
                                <p  className='help'>Kogus/maht ja ühik</p>
                            </div>
                            <div className='form'>
                            <label>Käibemaksumäär</label> 
                                <input type="number" name="vat" placeholder="KM %" value={item.vat} onChange={(e) => handleItemChange(index, e)} />
                            </div>
                            <div className='form'>
                            <label>Summa</label> 
                                <input type="number" name="totalInclVat" placeholder="KM %" value={formData.totalInclVat} onChange={(e) => handleItemChange(index, e)}  readOnly/>
                                <p  className='help'>Hind km-ga</p>
                            </div>
                            <button type="button" className='remove-button' onClick={() => removeItem(index)}>X</button>
                        </div>
                    </div>
                ))}
                <button type="button" onClick={addItem}>Lisa +</button>
            <div className="form-totals">
                <div className='total'>
                    <p>Summa km-ta: {formData.totalExclVat} €</p>
                </div>
                <div className='total'>
                    <p>Käibemaks kokku: {formData.totalVat} €</p>
                </div>
                <div className='total'>
                    <p>Arve summa: {formData.totalInclVat} €</p>
                </div>
            </div>
            <button type="submit">Lae alla</button>
        </form>
    );
};

export default InvoiceForm;
